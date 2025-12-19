
const express = require('express');
const safeAsync = require('../utils/safeAsync');
const { requireRole, requireOwnerOrAdmin } = require('../utils/permissions');

module.exports = (pool, logAction) => {
    const router = express.Router();

    // 1. GET /api/team - Fetch Team Roster
    // Access: All authenticated members
    router.get('/', safeAsync(async (req, res) => {
        const orgId = req.user.organization_id;

        // Fetch Members
        const membersRes = await pool.query(
            `SELECT u.id, u.email, u.created_at, p.first_name, p.last_name, p.role 
             FROM users u
             JOIN profiles p ON u.id = p.user_id
             WHERE u.organization_id = $1
             ORDER BY p.role = 'owner' DESC, u.created_at ASC`,
            [orgId]
        );

        // Fetch Active Invites
        const invitesRes = await pool.query(
            `SELECT id, email, role, created_at, expires_at 
             FROM organization_invites 
             WHERE organization_id = $1 AND used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC`,
            [orgId]
        );

        await logAction(req.user.id, 'VIEW_TEAM', {}, req, orgId);

        res.json({
            members: membersRes.rows.map(m => ({
                id: m.id,
                name: `${m.first_name} ${m.last_name}`.trim() || 'Pending Setup',
                email: m.email,
                role: m.role,
                joinedAt: m.created_at
            })),
            invites: invitesRes.rows
        });
    }));

    // 2. DELETE /api/team/member/:id - Remove User
    // Access: Owner or Admin (with restrictions)
    router.delete('/member/:id', requireOwnerOrAdmin, safeAsync(async (req, res) => {
        const targetUserId = req.params.id;
        const orgId = req.user.organization_id;
        const actorRole = req.user.role;
        const actorId = req.user.id;

        if (!targetUserId) throw new Error("Target User ID required");

        // Self-deletion check
        if (targetUserId === actorId.toString()) {
            const err = new Error("You cannot remove yourself.");
            err.status = 403;
            throw err;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Fetch Target Role & Verify Organization
            const targetRes = await client.query(
                `SELECT u.id, p.role 
                 FROM users u 
                 JOIN profiles p ON u.id = p.user_id 
                 WHERE u.id = $1 AND u.organization_id = $2`,
                [targetUserId, orgId]
            );

            if (targetRes.rows.length === 0) {
                throw new Error("User not found in your organization");
            }

            const targetRole = targetRes.rows[0].role;

            // Enforcement Logic
            // Admin cannot delete Owner or Admin
            if (actorRole === 'admin' && (targetRole === 'owner' || targetRole === 'admin')) {
                const err = new Error("Insufficient permissions to remove this user.");
                err.status = 403;
                throw err;
            }

            // Owner can delete anyone (except self, handled above)

            console.log(`[SECURITY] ${actorRole} performed REMOVE_MEMBER on ${targetUserId}`);

            // Delete User (Cascade removes profile, logs, etc.)
            await client.query('DELETE FROM users WHERE id = $1', [targetUserId]);

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        await logAction(actorId, 'REMOVE_MEMBER', { targetUserId }, req, orgId);
        res.json({ success: true });
    }));

    // 3. PATCH /api/team/member/:id/role - Change Role
    // Access: Owner Only
    router.patch('/member/:id/role', requireRole('owner'), safeAsync(async (req, res) => {
        const targetUserId = req.params.id;
        const { role: newRole } = req.body;
        const orgId = req.user.organization_id;

        if (!targetUserId) throw new Error("Target User ID required");
        if (!['admin', 'member'].includes(newRole)) {
            throw new Error("Invalid role assignment. Can only assign 'admin' or 'member'.");
        }

        // Prevent modifying self (Owner cannot demote self)
        if (targetUserId === req.user.id.toString()) {
            const err = new Error("You cannot change your own role.");
            err.status = 403;
            throw err;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verify User exists in Org
            const checkRes = await client.query(
                'SELECT id FROM users WHERE id = $1 AND organization_id = $2',
                [targetUserId, orgId]
            );

            if (checkRes.rows.length === 0) {
                throw new Error("User not found in your organization");
            }

            console.log(`[SECURITY] owner performed CHANGE_ROLE on ${targetUserId} to ${newRole}`);

            await client.query(
                'UPDATE profiles SET role = $1 WHERE user_id = $2',
                [newRole, targetUserId]
            );

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        await logAction(req.user.id, 'CHANGE_ROLE', { targetUserId, newRole }, req, orgId);
        res.json({ success: true });
    }));

    // 4. DELETE /api/team/invite/:id - Revoke Invite
    // Access: Owner or Admin
    router.delete('/invite/:id', requireOwnerOrAdmin, safeAsync(async (req, res) => {
        const inviteId = req.params.id;
        const orgId = req.user.organization_id;

        if (!inviteId) throw new Error("Invite ID required");

        const result = await pool.query(
            'DELETE FROM organization_invites WHERE id = $1 AND organization_id = $2 RETURNING email',
            [inviteId, orgId]
        );

        if (result.rowCount === 0) {
            throw new Error("Invite not found");
        }

        console.log(`[SECURITY] ${req.user.role} performed REVOKE_INVITE on ${inviteId}`);
        await logAction(req.user.id, 'REVOKE_INVITE', { email: result.rows[0].email }, req, orgId);
        
        res.json({ success: true });
    }));

    return router;
};
