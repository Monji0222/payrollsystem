const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { logActivity } = require('../middleware/logger');

const userController = {
  async getAll(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        department = '', 
        status = '',
        role = ''
      } = req.query;

      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM users WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR employee_id ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (department) {
        query += ` AND department = $${paramIndex}`;
        params.push(department);
        paramIndex++;
      }

      if (status) {
        query += ` AND employment_status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (role) {
        query += ` AND role = $${paramIndex}`;
        params.push(role);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
      const countParams = [];
      if (search) countParams.push(`%${search}%`);
      if (department) countParams.push(department);
      if (status) countParams.push(status);
      if (role) countParams.push(role);

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      const users = result.rows.map(user => {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.userId !== parseInt(id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const { password_hash, ...user } = result.rows[0];

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const {
        employeeId,
        email,
        password,
        firstName,
        lastName,
        middleName,
        role,
        position,
        department,
        basicSalary,
        dateHired,
        dateOfBirth,
        contactNumber,
        address
      } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users 
        (employee_id, email, password_hash, first_name, last_name, middle_name, 
         role, position, department, basic_salary, employment_status, date_hired, 
         date_of_birth, contact_number, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          employeeId,
          email.toLowerCase(),
          hashedPassword,
          firstName,
          lastName,
          middleName || null,
          role,
          position || null,
          department || null,
          basicSalary || null,
          'active',
          dateHired || new Date(),
          dateOfBirth || null,
          contactNumber || null,
          address || null
        ]
      );

      await logActivity({
        userId: req.user.userId,
        action: 'CREATE_USER',
        entityType: 'user',
        entityId: result.rows[0].id,
        details: { employeeId, email }
      });

      const { password_hash, ...user } = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.userId !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove sensitive fields
    delete updates.password;
    delete updates.password_hash;

    // Map camelCase to snake_case for database columns
    const columnMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      middleName: 'middle_name',
      employeeId: 'employee_id',
      basicSalary: 'basic_salary',
      employmentStatus: 'employment_status',
      dateHired: 'date_hired',
      dateOfBirth: 'date_of_birth',
      contactNumber: 'contact_number',
      profileImage: 'profile_image'
    };

    // Convert camelCase keys to snake_case
    const dbUpdates = {};
    Object.keys(updates).forEach(key => {
      const dbColumn = columnMap[key] || key;
      dbUpdates[dbColumn] = updates[key];
    });

    if (Object.keys(dbUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Build SQL query
    const setClause = Object.keys(dbUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [id, ...Object.values(dbUpdates)];
    const query = `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE_USER',
      entityType: 'user',
      entityId: id,
      details: dbUpdates
    });

    const { password_hash, ...user } = result.rows[0];

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
},


  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await logActivity({
        userId: req.user.userId,
        action: 'DELETE_USER',
        entityType: 'user',
        entityId: id
      });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async changeStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await pool.query(
        'UPDATE users SET employment_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await logActivity({
        userId: req.user.userId,
        action: 'CHANGE_USER_STATUS',
        entityType: 'user',
        entityId: id,
        details: { status }
      });

      const { password_hash, ...user } = result.rows[0];

      res.json({
        success: true,
        message: 'Status updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const { password_hash, ...user } = result.rows[0];

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;