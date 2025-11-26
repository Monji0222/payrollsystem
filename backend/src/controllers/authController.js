const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const jwtConfig = require('../config/jwt');
const { logActivity } = require('../middleware/logger');

const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND employment_status = $2',
        [email.toLowerCase(), 'active']
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        jwtConfig.refreshSecret,
        { expiresIn: jwtConfig.refreshExpiresIn }
      );

      await logActivity({
        userId: user.id,
        action: 'LOGIN',
        entityType: 'auth',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

      const result = await pool.query(
        'SELECT id, role FROM users WHERE id = $1 AND employment_status = $2',
        [decoded.userId, 'active']
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      const accessToken = jwt.sign(
        { userId: decoded.userId, role: result.rows[0].role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      res.json({
        success: true,
        data: { accessToken }
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      await logActivity({
        userId: req.user.userId,
        action: 'LOGOUT',
        entityType: 'auth',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;