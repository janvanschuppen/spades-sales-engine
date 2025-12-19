
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Determine API Base URL
const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Test Data Configuration
const TEST_ORG_NAME = 'TeamTest Corp';
const OWNER_EMAIL = 'team_test_owner@local.test';
const MEMBER_EMAIL = 'new.member@local.test';
const PASSWORD = 'Test123!';

async function runTests() {
    let passed = true;
    const client = await pool.connect();

    const logPass = (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    const logFail = (msg, err) => {
        console.log(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        if (err) {
            if (err.response) {
                console.error(`Status: ${err.response.status}, Data:`, err.response.data);
            } else {
                console.error(err.message);
            }
        }
        passed = false;
    };

    try {
        console.log('--- TEAM INVITATION SYSTEM VERIFICATION ---');
        console.log(`Target: ${BASE_URL}`);

        // --- 0. CLEANUP ---
        // Clean up previous test runs to ensure idempotency
        await client.query('BEGIN');
        await client.query(`DELETE FROM users WHERE email IN ($1, $2)`, [OWNER_EMAIL, MEMBER_EMAIL]);
        // Deleting org cascades to invites, profiles, logs, tenant_data
        await client.query(`DELETE FROM organizations WHERE name = $1`, [TEST_ORG_NAME]);
        await client.query('COMMIT');
        
        // --- 1. SETUP OWNER ---
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(PASSWORD, salt);

        // Create Org
        const orgRes = await client.query(
            `INSERT INTO organizations (name) VALUES ($1) RETURNING id`, 
            [TEST_ORG_NAME]
        );
        const orgId = orgRes.rows[0].id;

        // Create Owner
        const ownerRes = await client.query(
            `INSERT INTO users (email, password_hash, organization_id, is_verified, active) 
             VALUES ($1, $2, $3, true, true) RETURNING id`,
            [OWNER_EMAIL, hash, orgId]
        );
        const ownerId = ownerRes.rows[0].id;

        // Create Profile
        await client.query(
            `INSERT INTO profiles (user_id, first_name, last_name, role) VALUES ($1, 'Test', 'Owner', 'owner')`,
            [ownerId]
        );

        // Login Owner via API
        let ownerCookie = '';
        try {
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: OWNER_EMAIL,
                password: PASSWORD
            });
            const cookies = loginRes.headers['set-cookie'];
            if (!cookies) throw new Error('No cookie returned from login');
            // Extract the auth_token part
            ownerCookie = cookies.find(c => c.startsWith('auth_token='));
            if (!ownerCookie) throw new Error('auth_token cookie not found');
            
            logPass('Owner Setup & Login');
        } catch (e) {
            logFail('Owner login failed', e);
            throw e; // Critical failure
        }

        // --- 2. CREATE INVITE ---
        let inviteToken = '';
        try {
            const res = await axios.post(
                `${BASE_URL}/api/invites/create`,
                { email: MEMBER_EMAIL },
                { headers: { Cookie: ownerCookie } }
            );
            
            const inviteLink = res.data.link;
            if (!inviteLink) throw new Error('No link in response');
            
            // Extract token from link
            inviteToken = inviteLink.split('/').pop();
            
            // Verify DB state
            const dbInvite = await client.query(
                `SELECT * FROM organization_invites WHERE token = $1`, 
                [inviteToken]
            );
            
            if (dbInvite.rows.length === 0) throw new Error('Invite not found in DB');
            if (dbInvite.rows[0].email !== MEMBER_EMAIL) throw new Error('Email mismatch');
            if (dbInvite.rows[0].organization_id !== orgId) throw new Error('Org ID mismatch');
            if (dbInvite.rows[0].used) throw new Error('Invite should be unused');

            logPass('Invite Creation verified');
        } catch (e) {
            logFail('Invite Creation failed', e);
            throw e;
        }

        // --- 3. VALIDATE INVITE ---
        try {
            const res = await axios.get(`${BASE_URL}/api/invites/validate/${inviteToken}`);
            if (!res.data.valid) throw new Error('Token reported invalid');
            if (res.data.email !== MEMBER_EMAIL) throw new Error('Email mismatch in validation');
            if (res.data.organizationName !== TEST_ORG_NAME) throw new Error('Org Name mismatch');
            
            logPass('Invite Validation verified');
        } catch (e) {
            logFail('Invite Validation failed', e);
            throw e;
        }

        // --- 4. ACCEPT INVITE ---
        let memberCookie = '';
        try {
            const res = await axios.post(`${BASE_URL}/api/invites/accept`, {
                token: inviteToken,
                password: PASSWORD,
                name: 'New Member'
            });
            
            if (!res.data.success) throw new Error('Accept response not success');
            if (res.data.user.role !== 'member') throw new Error('Role is not member');
            if (res.data.user.organization_id !== orgId) throw new Error('Org ID mismatch on user');

            // Get new session
            const cookies = res.headers['set-cookie'];
            memberCookie = cookies.find(c => c.startsWith('auth_token='));

            // Verify DB Side: User
            const userCheck = await client.query(`SELECT * FROM users WHERE email = $1`, [MEMBER_EMAIL]);
            if (userCheck.rows.length === 0) throw new Error('User not created in DB');
            if (userCheck.rows[0].organization_id !== orgId) throw new Error('DB User org mismatch');

            // Verify DB Side: Invite
            const inviteCheck = await client.query(`SELECT * FROM organization_invites WHERE token = $1`, [inviteToken]);
            if (!inviteCheck.rows[0].used) throw new Error('Invite not marked used');

            logPass('Invite Acceptance & User Creation verified');
        } catch (e) {
            logFail('Invite Acceptance failed', e);
            throw e;
        }

        // --- 5. DUPLICATE PROTECTION ---
        // Scenario 1: Re-using used token
        try {
            await axios.post(`${BASE_URL}/api/invites/accept`, {
                token: inviteToken,
                password: PASSWORD,
                name: 'Hacker'
            });
            logFail('Re-using used token should have failed');
        } catch (e) {
            if (e.response && (e.response.status === 400 || e.response.status === 500)) {
                 logPass('Re-using used token prevented');
            } else {
                logFail('Re-use check failed with unexpected error', e);
            }
        }

        // Scenario 2: Existing User (Create NEW invite for same email)
        try {
            const res2 = await axios.post(`${BASE_URL}/api/invites/create`, { email: MEMBER_EMAIL }, { headers: { Cookie: ownerCookie } });
            const newToken = res2.data.link.split('/').pop();
            
            await axios.post(`${BASE_URL}/api/invites/accept`, {
                token: newToken,
                password: PASSWORD,
                name: 'Double Member'
            });
            logFail('Duplicate User Creation Allowed (Email Guard Failed)');
        } catch (e) {
            // We expect a 400 error about User already exists
            if (e.response && e.response.status === 400 && e.response.data.error.includes('already exists')) {
                 logPass('Duplicate Email Protection verified');
            } else {
                logFail('Duplicate Email Protection failed with unexpected error', e);
            }
        }

        // --- 6. ORGANIZATION ISOLATION ---
        try {
             // Member requesting data
             const res = await axios.get(`${BASE_URL}/api/data`, { headers: { Cookie: memberCookie } });
             if (res.data.organizationId !== orgId) throw new Error(`Member accessed Org ${res.data.organizationId}, expected ${orgId}`);
             logPass('Organization Isolation verified');
        } catch (e) {
            logFail('Organization Isolation failed', e);
        }

        // --- 7. AUDIT LOGS ---
        try {
            const logs = await client.query(
                `SELECT action FROM audit_logs WHERE organization_id = $1`, 
                [orgId]
            );
            const actions = logs.rows.map(r => r.action);
            
            const hasCreate = actions.includes('CREATE_INVITE');
            const hasAccept = actions.includes('ACCEPT_INVITE');

            if (hasCreate && hasAccept) {
                logPass('Audit Logs verified');
            } else {
                logFail(`Missing expected logs. Found: ${actions.join(', ')}`);
            }
        } catch (e) {
            logFail('Audit Log verification failed', e);
        }

        // --- 8. TOKEN INVALIDATION (Detailed) ---
        try {
             // 8a. Fake Token
             const fakeRes = await axios.get(`${BASE_URL}/api/invites/validate/fake_token_123`);
             if (fakeRes.data.valid !== false) throw new Error('Fake token returned valid=true');
             
             // 8b. Expired Token Logic
             // 1. Create fresh token
             const expInviteRes = await axios.post(`${BASE_URL}/api/invites/create`, { email: 'expired@test.com' }, { headers: { Cookie: ownerCookie } });
             const expToken = expInviteRes.data.link.split('/').pop();
             
             // 2. Manipulate DB to expire it
             await client.query(`UPDATE organization_invites SET expires_at = NOW() - INTERVAL '1 hour' WHERE token = $1`, [expToken]);
             
             // 3. Verify
             const expValidate = await axios.get(`${BASE_URL}/api/invites/validate/${expToken}`);
             if (expValidate.data.valid !== false) throw new Error('Expired token returned valid=true');

             logPass('Token Invalidation Logic verified');
        } catch (e) {
            logFail('Token Invalidation test failed', e);
        }

    } catch (err) {
        logFail('Global Test Execution Error', err);
    } finally {
        // Cleanup connection
        client.release();
        await pool.end();

        console.log('\n--- VERIFICATION SUMMARY ---');
        if (passed) {
             console.log('\x1b[32mALL TEAM MANAGEMENT CORE FEATURES VERIFIED\x1b[0m');
             process.exit(0);
        } else {
             console.log('\x1b[31m--- TEAM INVITATION VERIFICATION FAILED ---\x1b[0m');
             process.exit(1);
        }
    }
}

runTests();
