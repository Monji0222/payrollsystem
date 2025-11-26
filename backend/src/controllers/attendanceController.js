const pool = require('../config/database');
const { logActivity } = require('../middleware/logger');

const attendanceController = {
  async getAll(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        userId = '', 
        date = '',
        status = '',
        startDate = '',
        endDate = ''
      } = req.query;

      const offset = (page - 1) * limit;
      let query = `
        SELECT a.*, u.first_name, u.last_name, u.employee_id, u.position
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (userId) {
        query += ` AND a.user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (date) {
        query += ` AND a.date = $${paramIndex}`;
        params.push(date);
        paramIndex++;
      }

      if (status) {
        query += ` AND a.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (startDate && endDate) {
        query += ` AND a.date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(startDate, endDate);
        paramIndex += 2;
      }

      query += ` ORDER BY a.date DESC, a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      let countQuery = 'SELECT COUNT(*) FROM attendance WHERE 1=1';
      const countParams = [];
      if (userId) countParams.push(userId);
      if (date) countParams.push(date);
      if (status) countParams.push(status);

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          attendance: result.rows,
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

  async getMyAttendance(req, res, next) {
    try {
      const { page = 1, limit = 10, month, year } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT * FROM attendance 
        WHERE user_id = $1
      `;
      const params = [req.user.userId];
      let paramIndex = 2;

      if (month && year) {
        query += ` AND EXTRACT(MONTH FROM date) = $${paramIndex} AND EXTRACT(YEAR FROM date) = $${paramIndex + 1}`;
        params.push(month, year);
        paramIndex += 2;
      }

      query += ` ORDER BY date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM attendance WHERE user_id = $1',
        [req.user.userId]
      );
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          attendance: result.rows,
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

  async timeIn(req, res, next) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

      // Check if already timed in today
      const existing = await client.query(
        'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
        [req.user.userId, today]
      );

      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Already timed in today'
        });
      }

      // Calculate if late (assuming work starts at 8:00 AM)
      const workStartTime = '08:00';
      const isLate = currentTime > workStartTime;
      let lateMinutes = 0;

      if (isLate) {
        const [startHour, startMin] = workStartTime.split(':').map(Number);
        const [currentHour, currentMin] = currentTime.split(':').map(Number);
        lateMinutes = (currentHour - startHour) * 60 + (currentMin - startMin);
      }

      const result = await client.query(
        `INSERT INTO attendance (user_id, date, time_in, late_minutes, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          req.user.userId,
          today,
          currentTime,
          lateMinutes,
          isLate ? 'late' : 'present'
        ]
      );

      await logActivity({
        userId: req.user.userId,
        action: 'TIME_IN',
        entityType: 'attendance',
        entityId: result.rows[0].id,
        ipAddress: req.ip
      });

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Timed in successfully',
        data: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  async timeOut(req, res, next) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

      // Get today's attendance
      const existing = await client.query(
        'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
        [req.user.userId, today]
      );

      if (existing.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'No time-in record found for today'
        });
      }

      const attendance = existing.rows[0];

      if (attendance.time_out) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Already timed out today'
        });
      }

      // Calculate total hours and overtime
      const timeIn = attendance.time_in;
      const [inHour, inMin] = timeIn.split(':').map(Number);
      const [outHour, outMin] = currentTime.split(':').map(Number);

      let totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
      const totalHours = (totalMinutes / 60).toFixed(2);

      // Calculate overtime (assuming 8 hours work day)
      const regularHours = 8;
      let overtimeHours = 0;
      if (totalHours > regularHours) {
        overtimeHours = (totalHours - regularHours).toFixed(2);
      }

      const result = await client.query(
        `UPDATE attendance 
         SET time_out = $1, total_hours = $2, overtime_hours = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [currentTime, totalHours, overtimeHours, attendance.id]
      );

      await logActivity({
        userId: req.user.userId,
        action: 'TIME_OUT',
        entityType: 'attendance',
        entityId: attendance.id,
        ipAddress: req.ip
      });

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Timed out successfully',
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
    try {
      const { id } = req.params;
      const { timeIn, timeOut, status, remarks } = req.body;

      let totalHours = null;
      let overtimeHours = 0;

      if (timeIn && timeOut) {
        const [inHour, inMin] = timeIn.split(':').map(Number);
        const [outHour, outMin] = timeOut.split(':').map(Number);
        const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
        totalHours = (totalMinutes / 60).toFixed(2);

        if (totalHours > 8) {
          overtimeHours = (totalHours - 8).toFixed(2);
        }
      }

      const result = await pool.query(
        `UPDATE attendance 
         SET time_in = COALESCE($1, time_in),
             time_out = COALESCE($2, time_out),
             total_hours = COALESCE($3, total_hours),
             overtime_hours = COALESCE($4, overtime_hours),
             status = COALESCE($5, status),
             remarks = COALESCE($6, remarks),
             updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [timeIn, timeOut, totalHours, overtimeHours, status, remarks, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      await logActivity({
        userId: req.user.userId,
        action: 'UPDATE_ATTENDANCE',
        entityType: 'attendance',
        entityId: id,
        details: req.body
      });

      res.json({
        success: true,
        message: 'Attendance updated successfully',
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
        'DELETE FROM attendance WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      await logActivity({
        userId: req.user.userId,
        action: 'DELETE_ATTENDANCE',
        entityType: 'attendance',
        entityId: id
      });

      res.json({
        success: true,
        message: 'Attendance deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getMonthlyReport(req, res, next) {
    try {
      const { userId } = req.params;
      const { month, year } = req.query;

      // Check authorization
      if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.userId !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const result = await pool.query(
        `SELECT 
          a.*,
          u.first_name,
          u.last_name,
          u.employee_id,
          u.position
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = $1 
        AND EXTRACT(MONTH FROM a.date) = $2 
        AND EXTRACT(YEAR FROM a.date) = $3
        ORDER BY a.date ASC`,
        [userId, month, year]
      );

      // Calculate summary
      const summary = {
        totalDays: result.rows.length,
        presentDays: result.rows.filter(r => r.status === 'present').length,
        lateDays: result.rows.filter(r => r.status === 'late').length,
        absentDays: result.rows.filter(r => r.status === 'absent').length,
        halfDays: result.rows.filter(r => r.status === 'half_day').length,
        totalHours: result.rows.reduce((sum, r) => sum + parseFloat(r.total_hours || 0), 0),
        totalOvertimeHours: result.rows.reduce((sum, r) => sum + parseFloat(r.overtime_hours || 0), 0),
        totalLateMinutes: result.rows.reduce((sum, r) => sum + parseInt(r.late_minutes || 0), 0)
      };

      res.json({
        success: true,
        data: {
          attendance: result.rows,
          summary
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = attendanceController;