
/**
 * RBAC VERIFICATION SCRIPT
 * Phase 2.5 Final Exam
 */
require('dotenv').config(); 
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE = process.env.TEST_BASE_URL || "http://localhost:3001"; 
let failures = 0;

// Helpers 
const log = (msg) => console.log(msg); 
const pass = (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`); 
const fail = (msg) => { console.log(`\x1b[31m[FAIL]\x1b[0m ${msg}`); failures++; };

async function api(path, method = "GET", body, token) { 
    const res = await fetch(BASE + path, { 
        method, 
        headers: { 
            "Content-Type": "application/json", 
            ...(token ? { "Authorization": `Bearer ${token}` } : {}) 
        }, 
        body: body ? JSON.stringify(body) : undefined 
    });

    const text = await res.text(); 
    let json = null; 
    try { json = JSON.parse(text); } catch (e) {}

    return { status: res.status, data: json }; 
}

// ------------------------------------- 
// USER CREATION + LOGIN 
// -------------------------------------

async function createUser(email, password, name, role, orgId) { 
    // Uses the helper route to bypass email verification for speed 
    await api("/api/admin/create-test-user", "POST", { email, password, name, role, organization_id: orgId }); 
}

async function login(email, password) { 
    const res = await api("/api/auth/login", "POST", { email, password }); 
    return res.data?.token || res.data?.user?.token; 
}

async function run() { 
    log("\n=== RBAC VERIFICATION START ===");

    // 1. Setup Actors 
    // We explicitly use a unique timestamp or random string to avoid duplicate email errors on re-runs 
    const suffix = Date.now(); 
    const ownerEmail = `owner_${suffix}@test.com`; 
    const adminEmail = `admin_${suffix}@test.com`; 
    const memberEmail = `member_${suffix}@test.com`; 
    const admin2Email = `admin2_${suffix}@test.com`; 
    const victimEmail = `victim_${suffix}@test.com`; 
    const intruderEmail = `intruder_${suffix}@test.com`;

    // Create Users (Backend helper should create org if orgId is null) 
    await createUser(ownerEmail, "pass123", "OwnerUser", "owner"); 
    await createUser(adminEmail, "pass123", "AdminUser", "admin"); 
    await createUser(memberEmail, "pass123", "MemberUser", "member"); 
    await createUser(admin2Email, "pass123", "AdminTwo", "admin"); 
    await createUser(victimEmail, "pass123", "VictimUser", "member"); 
    await createUser(intruderEmail, "pass123", "IntruderUser", "member", 9999); // Different Org

    const tokenA = await login(ownerEmail, "pass123"); 
    const tokenB = await login(adminEmail, "pass123"); 
    const tokenC = await login(memberEmail, "pass123");

    if (!tokenA || !tokenB || !tokenC) { 
        fail("CRITICAL: Login failed. Cannot run tests."); 
        process.exit(1); 
    }

    // ----------------------------- 
    // TEST 1: VISIBILITY 
    // ----------------------------- 
    log("\n[TEST 1] Visibility"); 
    for (const [name, token] of [["Member", tokenC], ["Admin", tokenB], ["Owner", tokenA]]) { 
        const res = await api("/api/team", "GET", null, token); 
        if (res.status === 200) pass(`${name} can view roster`); 
        else fail(`${name} cannot view roster (Status: ${res.status})`); 
    }

    // ----------------------------- 
    // TEST 2: ADMIN MUTINY (Admin tries to delete Owner) 
    // ----------------------------- 
    log("\n[TEST 2] Mutiny Check");

    // Fetch IDs first 
    const rosterRes = await api("/api/team", "GET", null, tokenA); 
    const members = rosterRes.data?.members || [];

    const ownerId = members.find(m => m.email === ownerEmail)?.id; 
    const admin2Id = members.find(m => m.email === admin2Email)?.id; 
    const adminId = members.find(m => m.email === adminEmail)?.id; 
    const victimId = members.find(m => m.email === victimEmail)?.id; 
    const memberId = members.find(m => m.email === memberEmail)?.id;

    if (!ownerId) { fail("Setup Error: Owner ID not found"); } 
    else { 
        const res = await api(`/api/team/member/${ownerId}`, "DELETE", null, tokenB); 
        if (res.status === 403) pass("Admin cannot delete Owner"); 
        else fail(`Admin deleted Owner (Status: ${res.status})`); 
    }

    if (!admin2Id) { fail("Setup Error: Admin2 ID not found"); } 
    else { 
        const res = await api(`/api/team/member/${admin2Id}`, "DELETE", null, tokenB); 
        if (res.status === 403) pass("Admin cannot delete Admin"); 
        else fail(`Admin deleted another Admin (Status: ${res.status})`); 
    }

    // ----------------------------- 
    // TEST 3: MEMBER LIMITS 
    // ----------------------------- 
    log("\n[TEST 3] Member Restrictions");

    const resDel = await api(`/api/team/member/${adminId}`, "DELETE", null, tokenC); 
    resDel.status === 403 ? pass("Member cannot delete Admin") : fail("Member deleted Admin");

    const resPatch = await api(`/api/team/member/${adminId}/role`, "PATCH", { role: "owner" }, tokenC); 
    resPatch.status === 403 ? pass("Member cannot change roles") : fail("Member changed roles");

    // ----------------------------- 
    // TEST 4: OWNER SELF-DESTRUCT 
    // ----------------------------- 
    log("\n[TEST 4] Owner Self-Delete"); 
    const resSelf = await api(`/api/team/member/${ownerId}`, "DELETE", null, tokenA); 
    if (resSelf.status === 400 || resSelf.status === 403) pass("Owner cannot delete themselves"); 
    else fail("Owner deleted themselves");

    // ----------------------------- 
    // TEST 5: VALID ACTIONS 
    // ----------------------------- 
    log("\n[TEST 5] Valid Actions");

    const resPromote = await api(`/api/team/member/${memberId}/role`, "PATCH", { role: "admin" }, tokenA); 
    resPromote.status === 200 ? pass("Owner can promote Member") : fail(`Owner failed to promote Member (${resPromote.status})`);

    const resDeleteVictim = await api(`/api/team/member/${victimId}`, "DELETE", null, tokenB); 
    resDeleteVictim.status === 200 ? pass("Admin can delete Member") : fail(`Admin failed to delete Member (${resDeleteVictim.status})`);

    // ----------------------------- 
    // TEST 6: CROSS-ORG ISOLATION 
    // ----------------------------- 
    log("\n[TEST 6] Tenant Isolation"); 
    // Owner (Org 1) looks for Intruder (Org 9999) 
    const resOrgCheck = await api("/api/team", "GET", null, tokenA); 
    const intruderVisible = resOrgCheck.data?.members?.find(m => m.email === intruderEmail);

    if (!intruderVisible) pass("Owner cannot see Cross-Org Users"); 
    else fail("DATA LEAK: Owner can see user from another Org!");

    // ----------------------------- 
    // TEST 7: INVITE ABUSE 
    // ----------------------------- 
    log("\n[TEST 7] Invite Abuse"); 
    const invite = await api("/api/invites/create", "POST", { email: `newuser_${suffix}@test.com` }, tokenA); 
    const link = invite.data?.link;

    if (!link) { fail("Could not generate invite link"); } 
    else { 
        const inviteToken = link.split("/").pop();

        // Wrong email
        const resWrong = await api("/api/invites/accept", "POST", { token: inviteToken, name: "X", password: "P", email: "wrong@test.com" });
        resWrong.status !== 200 ? pass("Invalid email rejected") : fail("Invite accepted with wrong email");
        
        // Success then Reuse
        await api("/api/invites/accept", "POST", { token: inviteToken, name: "Correct", password: "pass123", email: `newuser_${suffix}@test.com` });
        const resReuse = await api("/api/invites/accept", "POST", { token: inviteToken, name: "X", password: "P", email: `newuser_${suffix}@test.com` });
        resReuse.status !== 200 ? pass("Used token rejected") : fail("Invite reused");
    }

    // ----------------------------- 
    // RESULT 
    // ----------------------------- 
    log("\n=== RBAC VERIFICATION COMPLETE ==="); 
    if (failures === 0) { 
        pass("ALL CHECKS PASSED"); 
        process.exit(0); 
    } else { 
        fail(`${failures} checks failed`); 
        process.exit(1); 
    } 
}

run();
