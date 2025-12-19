
const express = require('express');
const bcrypt = require('bcryptjs');
const safeAsync = require('../utils/safeAsync');

module.exports = (pool) => {
    const router = express.Router();

    // POST /api/admin/create-test-user
    router.post('/create-test-user', safeAsync(async (req, res) => {
        // Security Guard
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Test route not available in production' });
        }

        const { email, password, name, role, organization_id } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let orgId = organization_id;

            // Handle Organization Logic
            if (!orgId) {
                // If no ID provided, try to find or create "Test Org"
                const orgRes = await client.query("SELECT id FROM organizations WHERE name = 'Test Org'");
                if (orgRes.rows.length > 0) {
                    orgId = orgRes.rows[0].id;
                } else {
                    const newOrg = await client.query("INSERT INTO organizations (name) VALUES ('Test Org') RETURNING id");
                    orgId = newOrg.rows[0].id;
                }
            } else {
                // If ID provided (e.g. 9999), ensure it exists
                const check = await client.query("SELECT id FROM organizations WHERE id = $1", [orgId]);
                if (check.rows.length === 0) {
                     // Create dummy org with explicit ID to satisfy FK constraints for the test script
                     try {
                        // Try forcing the ID
                        await client.query("INSERT INTO organizations (id, name) VALUES ($1, 'External Org')", [orgId]);
                     } catch(e) {
                        // Fallback: Just create a new org and use its ID (Script doesn't strictly check the ID, just isolation)
                        const newOrg = await client.query("INSERT INTO organizations (name) VALUES ('External Org') RETURNING id");
                        orgId = newOrg.rows[0].id;
                     }
                }
            }

            // Create User
            const userRes = await client.query(
                `INSERT INTO users (email, password_hash, organization_id, is_verified, active) 
                 VALUES ($1, $2, $3, true, true) RETURNING id`,
                [email, hash, orgId]
            );
            const userId = userRes.rows[0].id;

            // Create Profile
            const nameParts = (name || 'Test User').split(' ');
            await client.query(
                `INSERT INTO profiles (user_id, first_name, last_name, role) VALUES ($1, $2, $3, $4)`,
                [userId, nameParts[0], nameParts[1] || '', role]
            );

            await client.query('COMMIT');
            res.json({ success: true, user: { id: userId, email, role, organization_id: orgId } });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }));

    return router;
};
