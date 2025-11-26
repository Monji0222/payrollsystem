const pool = require('../config/database');
const payrollService = require('../services/payrollService');
const { logActivity } = require('../middleware/logger');

const payrollController = {
  async generatePayroll(req, res, next) {
    try {
      const { periodStart, periodEnd, employeeIds } = req.body;

      const results = {
        generated: 0,
        failed: 0,
        errors: [],
        totalAmount: 0
      };

      for (const employeeId of employeeIds) {
        try {
          const payroll = await payrollService.calculatePayroll(
            employeeId,
            periodStart,
            periodEnd
          );
          results.generated++;
          results.totalAmount += parseFloat(payroll.net_pay);
        } catch (error) {
          results.failed++;
          results.errors.push({
            employeeId,
            error: error.message
          });
        }
      }

      await logActivity({
        userId: req.user.userId,
        action: 'GENERATE_PAYROLL',
        entityType: 'payroll',
        details: { periodStart, periodEnd, results }
      });

      res.json({
        success: true,
        message: `Payroll generated for ${results.generated} employee(s)`,
        data: results
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status = '', 
        userId = '',
        periodStart = '',
        periodEnd = ''
      } = req.query;

      const offset = (page - 1) * limit;
      let query = `
        SELECT p.*, u.first_name, u.last_name, u.employee_id, u.position
        FROM payroll p
        JOIN users u ON p.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND p.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (userId) {
        query += ` AND p.user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (periodStart && periodEnd) {
        query += ` AND p.period_start >= $${paramIndex} AND p.period_end <= $${paramIndex + 1}`;
        params.push(periodStart, periodEnd);
        paramIndex += 2;
      }

      query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      let countQuery = 'SELECT COUNT(*) FROM payroll WHERE 1=1';
      const countParams = [];
      if (status) countParams.push(status);
      if (userId) countParams.push(userId);

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          payrolls: result.rows,
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

  async getMyPayroll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const result = await pool.query(
        `SELECT * FROM payroll 
         WHERE user_id = $1 AND status IN ('approved', 'processed')
         ORDER BY period_start DESC 
         LIMIT $2 OFFSET $3`,
        [req.user.userId, limit, offset]
      );

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM payroll WHERE user_id = $1',
        [req.user.userId]
      );
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          payrolls: result.rows,
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

      const result = await pool.query(
        `SELECT p.*, 
                u.first_name, u.last_name, u.employee_id, u.position, u.department,
                a.first_name as approver_first_name, a.last_name as approver_last_name
         FROM payroll p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN users a ON p.approved_by = a.id
         WHERE p.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payroll not found'
        });
      }

      const payroll = result.rows[0];

      // Get payroll details (breakdown)
      const detailsResult = await pool.query(
        'SELECT * FROM payroll_details WHERE payroll_id = $1 ORDER BY item_type, item_name',
        [id]
      );

      payroll.details = detailsResult.rows;

      res.json({
        success: true,
        data: payroll
      });
    } catch (error) {
      next(error);
    }
  },

  async approve(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE payroll 
         SET status = 'approved', approved_by = $1, approved_at = NOW()
         WHERE id = $2 AND status IN ('draft', 'pending_approval')
         RETURNING *`,
        [req.user.userId, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payroll not found or already processed'
        });
      }

      await logActivity({
        userId: req.user.userId,
        action: 'APPROVE_PAYROLL',
        entityType: 'payroll',
        entityId: id
      });

      res.json({
        success: true,
        message: 'Payroll approved successfully',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM payroll WHERE id = $1 AND status = $2 RETURNING id',
        [id, 'draft']
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payroll not found or cannot be deleted'
        });
      }

      await logActivity({
        userId: req.user.userId,
        action: 'DELETE_PAYROLL',
        entityType: 'payroll',
        entityId: id
      });

      res.json({
        success: true,
        message: 'Payroll deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = payrollController;