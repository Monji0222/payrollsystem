const pool = require('../config/database');

const roleMiddleware = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const result = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userRole = result.rows[0].role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      req.user.role = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = roleMiddleware;
