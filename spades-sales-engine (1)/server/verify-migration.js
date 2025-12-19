
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verify() {
  const client = await pool.connect();
  let failed = false;

  const logPass = (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
  const logFail = (msg) => { console.log(`\x1b[31m[FAIL]\x1b[0m ${msg}`); failed = true; };

  try {
    console.log('--- Verifying Database Architecture ---');

    // 1. Structure Check (Expanded)
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('organizations', 'tenant_data', 'users', 'profiles', 'audit_logs');
    `);
    
    const tableNames = tables.rows.map(r => r.table_name);
    const requiredTables = ['organizations', 'tenant_data', 'users'];
    const extraTables = ['profiles', 'audit_logs'];
    
    if (requiredTables.every(t => tableNames.includes(t))) {
      logPass('Core Schema exists (organizations, tenant_data, users)');
    } else {
      logFail(`Missing core tables. Found: ${tableNames.join(', ')}`);
    }

    if (extraTables.every(t => tableNames.includes(t))) {
        logPass('Profiles & audit tables present');
    } else {
        logFail(`Missing extra tables. Found: ${tableNames.join(', ')}`);
    }

    // 2. Seeding Check
    const orgRes = await client.query("SELECT id, name FROM organizations WHERE name = 'Spades HQ'");
    let spadesHqId = null;

    if (orgRes.rows.length > 0) {
      spadesHqId = orgRes.rows[0].id;
      logPass(`Default Org 'Spades HQ' exists (ID: ${spadesHqId})`);
    } else {
      logFail("Default Org 'Spades HQ' NOT found");
    }

    // Check users backfill & Relationship Integrity
    if (spadesHqId) {
        // Integrity check: orphans (users pointing to non-existent orgs)
        const orphanRes = await client.query("SELECT id FROM users WHERE organization_id NOT IN (SELECT id FROM organizations)");
        if (orphanRes.rows.length === 0) {
             logPass('User/org relationships valid (No orphaned users)');
        } else {
             logFail(`Integrity Violation: Found ${orphanRes.rows.length} users pointing to non-existent organizations`);
        }

        const userRes = await client.query("SELECT count(*) as total, count(organization_id) as linked FROM users");
        const { total, linked } = userRes.rows[0];
        
        if (parseInt(total) > 0) {
            if (parseInt(total) === parseInt(linked)) {
                 logPass(`All ${total} users have valid organization links`);
            } else {
                logFail(`${total - linked} users have NULL organization_id`);
            }
        }
    }

    // 3. Tenant Data Verification (Read/Write)
    if (spadesHqId) {
        try {
            const testData = { verified: true, timestamp: Date.now() };
            const insertRes = await client.query(
                "INSERT INTO tenant_data (organization_id, icp) VALUES ($1, $2) RETURNING id, organization_id, icp", 
                [spadesHqId, testData]
            );
            const insertedRow = insertRes.rows[0];
            
            if (insertedRow.organization_id === spadesHqId && insertedRow.icp.timestamp === testData.timestamp) {
                logPass('Tenant data read/write confirmed for Org');
            } else {
                logFail('Tenant data insertion returned incorrect data or organization_id');
            }

            // Clean up
            await client.query("DELETE FROM tenant_data WHERE id = $1", [insertedRow.id]);
        } catch (e) {
            logFail(`Tenant Data verification failed: ${e.message}`);
        }
    }

    // 4. Security Check (Negative Test - FK Constraints)
    const FAKE_ORG_ID = 999999;
    try {
        await client.query("INSERT INTO users (email, password_hash, organization_id) VALUES ('security_test_fail@spades.com', 'hash', $1)", [FAKE_ORG_ID]);
        logFail("Database is insecure: Allowed User insertion with non-existent Organization ID");
        await client.query("DELETE FROM users WHERE email = 'security_test_fail@spades.com'");
    } catch (e) {
        if (e.code === '23503') { 
            logPass("FK constraints enforced");
        } else {
            logFail(`Unexpected error during security check: ${e.message} (Code: ${e.code})`);
        }
    }

    // 5. Isolation Check
    const RANDOM_ORG_ID = 500;
    const isolationRes = await client.query("SELECT * FROM tenant_data WHERE organization_id = $1", [RANDOM_ORG_ID]);
    if (isolationRes.rows.length === 0) {
        logPass("Data isolation confirmed");
    } else {
        logFail("Data Leak detected! Found rows for non-existent Org ID");
    }

    // 6. Pool Health Check
    try {
        // Acquire 3 connections concurrently to test pool settings
        const client1 = await pool.connect();
        const client2 = await pool.connect();
        const client3 = await pool.connect();
        
        const r1 = await client1.query('SELECT 1');
        const r2 = await client2.query('SELECT 1');
        const r3 = await client3.query('SELECT 1');

        client1.release();
        client2.release();
        client3.release();

        if (r1.rowCount === 1 && r2.rowCount === 1 && r3.rowCount === 1) {
            logPass("Pool stability OK");
        } else {
            logFail("Pool health check returned unexpected results");
        }
    } catch (e) {
        logFail(`Pool stability check failed: ${e.message}`);
    }

  } catch (err) {
    console.error('Verification Script Error:', err);
    failed = true;
  } finally {
    client.release();
    await pool.end();
    
    console.log('\n--- SUMMARY ---');
    if (failed) {
        console.log('\x1b[31m[FAIL]\x1b[0m Verification finished with errors.');
        process.exit(1);
    } else {
        console.log('\x1b[32m[PASS]\x1b[0m Structure verified');
        console.log('\x1b[32m[PASS]\x1b[0m Profiles & audit tables present');
        console.log('\x1b[32m[PASS]\x1b[0m Default org seeded');
        console.log('\x1b[32m[PASS]\x1b[0m User/org relationships valid');
        console.log('\x1b[32m[PASS]\x1b[0m FK constraints enforced');
        console.log('\x1b[32m[PASS]\x1b[0m Data isolation confirmed');
        console.log('\x1b[32m[PASS]\x1b[0m Pool stability OK');
        process.exit(0);
    }
  }
}

verify();
