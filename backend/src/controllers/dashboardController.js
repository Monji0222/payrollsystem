const pool = require('../config/database');

const dashboardController = {
  async getStats(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().getMonth() + 1;
      const thisYear = new Date().getFullYear();

      // Total employees
      const employeesResult = await pool.query(
        "SELECT COUNT(*) FROM users WHERE employment_status = 'active'"
      );
      const totalEmployees = parseInt(employeesResult.rows[0].count);

      // Present today
      const presentResult = await pool.query(
        "SELECT COUNT(*) FROM attendance WHERE date = $1 AND status IN ('present', 'late')",
        [today]
      );
      const presentToday = parseInt(presentResult.rows[0].count);

      // Pending leaves
      const leavesResult = await pool.query(
        "SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'"
      );
      const pendingLeaves = parseInt(leavesResult.rows[0].count);

      // Monthly payroll cost
      const payrollResult = await pool.query(
        `SELECT COALESCE(SUM(net_pay), 0) as total 
         FROM payroll 
         WHERE EXTRACT(MONTH FROM period_start) = $1 
         AND EXTRACT(YEAR FROM period_start) = $2
         AND status = 'approved'`,
        [thisMonth, thisYear]
      );
      const monthlyPayroll = parseFloat(payrollResult.rows[0].total);

      // Attendance data for chart (last 7 days)
      const attendanceChartResult = await pool.query(
        `SELECT 
           date,
           COUNT(*) FILTER (WHERE status IN ('present', 'late')) as present,
           COUNT(*) FILTER (WHERE status = 'absent') as absent,
           COUNT(*) FILTER (WHERE status = 'on_leave') as on_leave
         FROM attendance
         WHERE date >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY date
         ORDER BY date ASC`
      );

      // Department distribution
      const departmentResult = await pool.query(
        `SELECT department, COUNT(*) as count
         FROM users
         WHERE employment_status = 'active' AND department IS NOT NULL
         GROUP BY department
         ORDER BY count DESC
         LIMIT 5`
      );

      // Recent activities
      const activitiesResult = await pool.query(
        `SELECT al.*, u.first_name, u.last_name
         FROM activity_logs al
         LEFT JOIN users u ON al.user_id = u.id
         ORDER BY al.created_at DESC
         LIMIT 10`
      );

      res.json({
        success: true,
        data: {
          totalEmployees,
          presentToday,
          pendingLeaves,
          monthlyPayroll,
          attendanceData: attendanceChartResult.rows,
          departmentDistribution: departmentResult.rows,
          recentActivities: activitiesResult.rows
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getEmployeeStats(req, res, next) {
    try {
      const userId = req.user.userId;
      const thisMonth = new Date().getMonth() + 1;
      const thisYear = new Date().getFullYear();

      // My attendance this month
      const attendanceResult = await pool.query(
        `SELECT 
           COUNT(*) FILTER (WHERE status = 'present') as present_days,
           COUNT(*) FILTER (WHERE status = 'late') as late_days,
           COUNT(*) FILTER (WHERE status = 'absent') as absent_days,
           COALESCE(SUM(total_hours), 0) as total_hours,
           COALESCE(SUM(overtime_hours), 0) as overtime_hours
         FROM attendance
         WHERE user_id = $1 
         AND EXTRACT(MONTH FROM date) = $2 
         AND EXTRACT(YEAR FROM date) = $3`,
        [userId, thisMonth, thisYear]
      );

      // My leave credits
      const leaveCreditsResult = await pool.query(
        `SELECT lc.*, lt.name as leave_type_name
         FROM leave_credits lc
         JOIN leave_types lt ON lc.leave_type_id = lt.id
         WHERE lc.user_id = $1 AND lc.year = $2`,
        [userId, thisYear]
      );

      // My pending leave requests
      const pendingLeavesResult = await pool.query(
        `SELECT COUNT(*) FROM leave_requests 
         WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      // Latest payslip
      const latestPayrollResult = await pool.query(
        `SELECT * FROM payroll 
         WHERE user_id = $1 AND status IN ('approved', 'processed')
         ORDER BY period_start DESC
         LIMIT 1`,
        [userId]
      );

      res.json({
        success: true,
        data: {
          attendance: attendanceResult.rows[0],
          leaveCredits: leaveCreditsResult.rows,
          pendingLeaves: parseInt(pendingLeavesResult.rows[0].count),
          latestPayroll: latestPayrollResult.rows[0] || null
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;