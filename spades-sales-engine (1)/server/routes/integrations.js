const express = require('express');
const router = express.Router();
const { encrypt, decrypt } = require('../utils/crypto');
const { closeRequest } = require('../services/closeService');
const safeAsync = require('../utils/safeAsync');
const { requireOwnerOrAdmin } = require('../utils/permissions');

module.exports = (pool, logAction) => {
    // 1. Save Credentials (Owner/Admin only)
    router.post('/close/save', requireOwnerOrAdmin, safeAsync(async (req, res) => {
        const { api_key } = req.body;
        const orgId = req.user.organization_id;

        if (!api_key) {
            return res.status(400).json({ error: "API key is required" });
        }

        const encryptedKey = encrypt(api_key);

        await pool.query(
            `INSERT INTO organization_integrations (organization_id, provider, api_key)
             VALUES ($1, 'close', $2)
             ON CONFLICT (organization_id, provider) DO UPDATE SET 
                api_key = EXCLUDED.api_key, 
                updated_at = NOW()`,
            [orgId, encryptedKey]
        );

        await logAction(req.user.id, 'CRM_CREDENTIALS_SAVED', { provider: 'close' }, req, orgId);
        res.json({ status: "saved" });
    }));

    // 2. Test Connection (Owner/Admin only - Tests key before saving)
    router.post('/close/test', requireOwnerOrAdmin, safeAsync(async (req, res) => {
        const { api_key } = req.body;
        try {
            const data = await closeRequest(api_key, 'GET', '/me/');
            res.json({ valid: true, user: data.first_name || 'Verified User' });
        } catch (e) {
            res.json({ valid: false, error: "Invalid API Key" });
        }
    }));

    // 3. Lead Search Proxy
    router.post('/close/search', safeAsync(async (req, res) => {
        const { query } = req.body;
        const orgId = req.user.organization_id;

        const result = await pool.query(
            'SELECT api_key FROM organization_integrations WHERE organization_id = $1 AND provider = \'close\'',
            [orgId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "CRM not connected" });
        }

        const apiKey = decrypt(result.rows[0].api_key);
        const data = await closeRequest(apiKey, 'GET', `/lead/?query=${encodeURIComponent(query)}`);
        res.json(data);
    }));

    // 4. Lead Creation Proxy
    router.post('/close/create-lead', safeAsync(async (req, res) => {
        const { name, email, phone } = req.body;
        const orgId = req.user.organization_id;

        const result = await pool.query(
            'SELECT api_key FROM organization_integrations WHERE organization_id = $1 AND provider = \'close\'',
            [orgId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "CRM not connected" });
        }

        const apiKey = decrypt(result.rows[0].api_key);
        const payload = {
            name,
            contacts: [{ 
                emails: [{ email }], 
                phones: phone ? [{ phone }] : [] 
            }]
        };

        const data = await closeRequest(apiKey, 'POST', '/lead/', payload);
        await logAction(req.user.id, 'LEAD_CREATED', { leadId: data.id }, req, orgId);
        res.json(data);
    }));

    // 5. Integration Status
    router.get('/close/status', safeAsync(async (req, res) => {
        const orgId = req.user.organization_id;
        const result = await pool.query(
            'SELECT updated_at FROM organization_integrations WHERE organization_id = $1 AND provider = \'close\'',
            [orgId]
        );

        if (result.rows.length === 0) {
            return res.json({ connected: false });
        }

        res.json({ connected: true, last_updated: result.rows[0].updated_at });
    }));

    // 6. Debug / Health Check
    router.get('/close/debug', requireOwnerOrAdmin, safeAsync(async (req, res) => {
        const orgId = req.user.organization_id;
        const result = await pool.query(
            'SELECT count(*) FROM organization_integrations WHERE organization_id = $1 AND provider = \'close\'',
            [orgId]
        );
        res.json({ stored: parseInt(result.rows[0].count) > 0, provider: "close" });
    }));

    return router;
};