
/**
 * Role-Based Access Control Middleware
 */

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            const err = new Error('Unauthorized');
            err.status = 401;
            return next(err);
        }

        if (!allowedRoles.includes(req.user.role)) {
            const err = new Error('Insufficient permissions');
            err.status = 403;
            return next(err);
        }

        next();
    };
};

const requireOwnerOrAdmin = requireRole('owner', 'admin');

module.exports = {
    requireRole,
    requireOwnerOrAdmin
};
