const pool = require('../config/database');
const { logActivity } = require('../middleware/logger');

const leaveController = {
  async getAll(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status = '', 
        userId = '',
        leaveTypeId = ''
      } = req.query;

      const offset = (page - 1) * limit;
      let query = `
        SELECT lr.*, 
               u.first_name, u.last_name, u.employee_id,
               lt.name as leave_type_name,
               r.first_name as reviewer_first_name,
               r.last_name as reviewer_last_name
        FROM leave_requests lr
        JOIN users u ON lr.user_id = u.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        LEFT JOIN users r ON lr.reviewed_by = r.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND lr.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (userId) {
        query += ` AND lr.user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (leaveTypeId) {
        query += ` AND lr.leave_type_id = $${paramIndex}`;
        params.push(leaveTypeId);
        paramIndex++;
      }

      query += ` ORDER BY lr.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      let countQuery = 'SELECT COUNT(*) FROM leave_requests WHERE 1=1';
      const countParams = [];
      if (status) countParams.push(status);
      if (userId) countParams.push(userId);
      if (leaveTypeId) countParams.push(leaveTypeId);

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          leaves: result.rows,
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

  async getMyLeaves(req, res, next) {
    try {
      const { page = 1, limit = 10, status = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT lr.*, lt.name as leave_type_name,
               r.first_name as reviewer_first_name,
               r.last_name as reviewer_last_name
        FROM leave_requests lr
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        LEFT JOIN users r ON lr.reviewed_by = r.id
        WHERE lr.user_id = $1
      `;
      const params = [req.user.userId];
      let paramIndex = 2;

      if (status) {
        query += ` AND lr.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY lr.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM leave_requests WHERE user_id = $1',
        [req.user.userId]
      );
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          leaves: result.rows,
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
        `SELECT lr.*, 
               u.first_name, u.last_name, u.employee_id,
               lt.name as leave_type_name,
               r.first_name as reviewer_first_name,
               r.last_name as reviewer_last_name
        FROM leave_requests lr
        JOIN users u ON lr.user_id = u.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        LEFT JOIN users r ON lr.reviewed_by = r.id
        WHERE lr.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Leave request not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { leaveTypeId, startDate, endDate, reason } = req.body;

      // Calculate total days
      const start = new Date(startDate);
      const end = new Date(endDate);
      let totalDays = 0;

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
          totalDays++;
        }
      }

      // Check if user has enough leave credits
      const year = new Date().getFullYear();
      const creditsResult = await client.query(
        `SELECT remaining_credits FROM leave_credits 
         WHERE user_id = $1 AND leave_type_id = $2 AND year = $3`,
        [req.user.userId, leaveTypeId, year]
      );

      if (creditsResult.rows.length === 0) {
        // Initialize leave credits if not exists
        const leaveTypeResult = await client.query(
          'SELECT max_days FROM leave_types WHERE id = $1',
          [leaveTypeId]
        );

        if (leaveTypeResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            message: 'Leave type not found'
          });
        }

        const maxDays = leaveTypeResult.rows[0].max_days;
        await client.query(
          `INSERT INTO leave_credits (user_id, leave_type_id, total_credits, remaining_credits, year)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.user.userId, leaveTypeId, maxDays, maxDays, year]
        );

        if (totalDays > maxDays) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Insufficient leave credits. Available: ${maxDays} days`
          });
        }
      } else {
        const remainingCredits = parseFloat(creditsResult.rows[0].remaining_credits);
        if (totalDays > remainingCredits) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Insufficient leave credits. Available: ${remainingCredits} days`
          });
        }
      }

      // Create leave request
      const result = await client.query(
        `INSERT INTO leave_requests 
         (user_id, leave_type_id, start_date, end_date, total_days, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [req.user.userId, leaveTypeId, startDate, endDate, totalDays, reason, 'pending']
      );

      await logActivity({
        userId: req.user.userId,
        action: 'CREATE_LEAVE_REQUEST',
        entityType: 'leave',
        entityId: result.rows[0].id,
        details: { leaveTypeId, startDate, endDate, totalDays }
      });

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Leave request submitted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  async update(req, res, next) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { id } = req.params;
      const { startDate, endDate, reason } = req.body;

      // Check if leave belongs to user and is pending
      const leaveResult = await client.query(
        'SELECT * FROM leave_requests WHERE id = $1 AND user_id = $2',
        [id, req.user.userId]
      );

      if (leaveResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Leave request not found'
        });
      }

      const leave = leaveResult.rows[0];

      if (leave.status !== 'pending') {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Only pending leave requests can be updated'
        });
      }

      // Calculate new total days if dates changed
      let totalDays = leave.total_days;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        totalDays = 0;

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          const dayOfWeek = date.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            totalDays++;
          }
        }
      }

      const result = await client.query(
        `UPDATE leave_requests 
         SET start_date = COALESCE($1, start_date),
             end_date = COALESCE($2, end_date),
             total_days = $3,
             reason = COALESCE($4, reason),
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [startDate, endDate, totalDays, reason, id]
      );

      await logActivity({
        userId: req.user.userId,
        action: 'UPDATE_LEAVE_REQUEST',
        entityType: 'leave',
        entityId: id,
        details: req.body
      });

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Leave request updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  async approve(req, res, next) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { id } = req.params;
      const { reviewRemarks } = req.body;

      const leaveResult = await client.query(
        'SELECT * FROM leave_requests WHERE id = $1 AND status = $2',
        [id, 'pending']
      );

      if (leaveResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Leave request not found or already processed'
        });
      }

      const leave = leaveResult.rows[0];

      // Update leave request
      const result = await client.query(
        `UPDATE leave_requests 
         SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_remarks = $3
         WHERE id = $4
         RETURNING *`,
        ['approved', req.user.userId, reviewRemarks, id]
      );

      // Deduct leave credits
      const year = new Date().getFullYear();
      await client.query(
        `UPDATE leave_credits 
         SET used_credits = used_credits + $1,
             remaining_credits = remaining_credits - $1
         WHERE user_id = $2 AND leave_type_id = $3 AND year = $4`,
        [leave.total_days, leave.user_id, leave.leave_type_id, year]
      );

      // Mark attendance as on_leave for approved dates
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          const dateStr = date.toISOString().split('T')[0];
          
          // Insert or update attendance record
          await client.query(
            `INSERT INTO attendance (user_id, date, status)
             VALUES ($1, $2, 'on_leave')
             ON CONFLICT (user_id, date) 
             DO UPDATE SET status = 'on_leave'`,
            [leave.user_id, dateStr]
          );
        }
      }

      await logActivity({
        userId: req.user.userId,
        action: 'APPROVE_LEAVE',
        entityType: 'leave',
        entityId: id
      });

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Leave request approved successfully',
        data: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  async decline(req, res, next) {
    try {
      const { id } = req.params;
      const { reviewRemarks } = req.body;

      const result = await pool.query(
        `UPDATE leave_requests 
         SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_remarks = $3
         WHERE id = $4 AND status = $5
         RETURNING *`,
        ['declined', req.user.userId, reviewRemarks, id, 'pending']
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Leave request not found or already processed'
        });
      }

      await logActivity({
        userId: req.user.userId,
        action: 'DECLINE_LEAVE',
        entityType: 'leave',
        entityId: id
      });

      res.json({
        success: true,
        message: 'Leave request declined',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE leave_requests 
         SET status = $1, updated_at = NOW()
         WHERE id = $2 AND user_id = $3 AND status = $4
         RETURNING *`,
        ['cancelled', id, req.user.userId, 'pending']
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Leave request not found or cannot be cancelled'
        });
      }

      await logActivity({
        userId: req.user.userId,
        action: 'CANCEL_LEAVE',
        entityType: 'leave',
        entityId: id
      });

      res.json({
        success: true,
        message: 'Leave request cancelled successfully',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  async getLeaveCredits(req, res, next) {
    try {
      const { userId } = req.params;

      // Check authorization
      if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.userId !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const year = new Date().getFullYear();
      const result = await pool.query(
        `SELECT lc.*, lt.name as leave_type_name, lt.max_days
         FROM leave_credits lc
         JOIN leave_types lt ON lc.leave_type_id = lt.id
         WHERE lc.user_id = $1 AND lc.year = $2
         ORDER BY lt.name`,
        [userId, year]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  },

  async getLeaveTypes(req, res, next) {
    try {
      const result = await pool.query(
        'SELECT * FROM leave_types ORDER BY name'
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = leaveController;