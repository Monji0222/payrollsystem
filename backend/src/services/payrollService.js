const pool = require('../config/database');

class PayrollService {
  async calculatePayroll(userId, periodStart, periodEnd) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get employee basic salary
      const userResult = await client.query(
        'SELECT basic_salary, position, first_name, last_name FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        throw new Error('Employee not found');
      }

      const { basic_salary, first_name, last_name } = userResult.rows[0];

      if (!basic_salary || basic_salary <= 0) {
        throw new Error(`Employee ${first_name} ${last_name} has no basic salary set`);
      }

      // Calculate working days in period
      const workingDays = this.calculateWorkingDays(periodStart, periodEnd);
      
      // Get attendance data
      const attendanceResult = await client.query(
        `SELECT 
          COALESCE(SUM(total_hours), 0) as total_hours,
          COALESCE(SUM(overtime_hours), 0) as overtime_hours,
          COALESCE(SUM(late_minutes), 0) as late_minutes,
          COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
          COUNT(CASE WHEN status = 'half_day' THEN 1 END) as half_days
        FROM attendance 
        WHERE user_id = $1 
        AND date BETWEEN $2 AND $3`,
        [userId, periodStart, periodEnd]
      );

      const attendance = attendanceResult.rows[0];

      // Calculate rates
      const dailyRate = parseFloat(basic_salary) / workingDays;
      const hourlyRate = dailyRate / 8;

      // Calculate overtime pay (1.5x for regular overtime)
      const overtimePay = parseFloat(attendance.overtime_hours) * hourlyRate * 1.5;

      // Calculate deductions for absences and late
      const absenceDeduction = parseFloat(attendance.absent_days) * dailyRate;
      const halfDayDeduction = parseFloat(attendance.half_days) * (dailyRate / 2);
      const lateDeduction = (parseFloat(attendance.late_minutes) / 60) * hourlyRate;

      // Get active allowances
      const allowancesResult = await client.query(
        'SELECT * FROM allowances WHERE is_active = true'
      );
      
      let totalAllowances = 0;
      const allowanceDetails = [];
      
      for (const allowance of allowancesResult.rows) {
        let amount = 0;
        if (allowance.type === 'fixed') {
          amount = parseFloat(allowance.amount);
        } else if (allowance.type === 'percentage') {
          amount = (parseFloat(allowance.percentage) / 100) * parseFloat(basic_salary);
        }
        totalAllowances += amount;
        if (amount > 0) {
          allowanceDetails.push({
            name: allowance.name,
            amount: amount
          });
        }
      }

      // Calculate gross pay
      const grossPay = parseFloat(basic_salary) + overtimePay + totalAllowances;

      // Get active deductions
      const deductionsResult = await client.query(
        'SELECT * FROM deductions WHERE is_active = true'
      );
      
      let totalDeductions = absenceDeduction + halfDayDeduction + lateDeduction;
      const deductionDetails = [];

      if (absenceDeduction > 0) {
        deductionDetails.push({ name: 'Absence', amount: absenceDeduction });
      }
      if (halfDayDeduction > 0) {
        deductionDetails.push({ name: 'Half Day', amount: halfDayDeduction });
      }
      if (lateDeduction > 0) {
        deductionDetails.push({ name: 'Late', amount: lateDeduction });
      }

      for (const deduction of deductionsResult.rows) {
        let amount = 0;
        
        if (deduction.name === 'Withholding Tax') {
          // Calculate withholding tax based on Philippine tax table
          amount = this.calculateWithholdingTax(grossPay);
        } else {
          if (deduction.type === 'fixed') {
            amount = parseFloat(deduction.amount);
          } else if (deduction.type === 'percentage') {
            amount = (parseFloat(deduction.percentage) / 100) * parseFloat(basic_salary);
          }
        }
        
        totalDeductions += amount;
        if (amount > 0) {
          deductionDetails.push({
            name: deduction.name,
            amount: amount
          });
        }
      }

      // Calculate net pay
      const netPay = grossPay - totalDeductions;

      // Create payroll record
      const payrollResult = await client.query(
        `INSERT INTO payroll 
        (user_id, period_start, period_end, basic_salary, total_hours_worked, 
         overtime_pay, total_allowances, total_deductions, gross_pay, net_pay, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          userId, 
          periodStart, 
          periodEnd, 
          basic_salary,
          attendance.total_hours, 
          overtimePay, 
          totalAllowances,
          totalDeductions, 
          grossPay, 
          netPay, 
          'draft'
        ]
      );

      const payroll = payrollResult.rows[0];

      // Insert payroll details
      for (const allowance of allowanceDetails) {
        await client.query(
          `INSERT INTO payroll_details (payroll_id, item_type, item_name, amount)
           VALUES ($1, $2, $3, $4)`,
          [payroll.id, 'allowance', allowance.name, allowance.amount]
        );
      }

      // Add overtime as a detail
      if (overtimePay > 0) {
        await client.query(
          `INSERT INTO payroll_details (payroll_id, item_type, item_name, amount)
           VALUES ($1, $2, $3, $4)`,
          [payroll.id, 'overtime', 'Overtime Pay', overtimePay]
        );
      }

      for (const deduction of deductionDetails) {
        await client.query(
          `INSERT INTO payroll_details (payroll_id, item_type, item_name, amount)
           VALUES ($1, $2, $3, $4)`,
          [payroll.id, 'deduction', deduction.name, deduction.amount]
        );
      }

      await client.query('COMMIT');
      return payroll;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  calculateWorkingDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        workingDays++;
      }
    }

    return workingDays > 0 ? workingDays : 1; // Minimum 1 to avoid division by zero
  }

  calculateWithholdingTax(monthlyGross) {
    // Annualize the gross
    const annualGross = monthlyGross * 12;
    let tax = 0;

    // Philippine tax brackets (2025 - simplified)
    // Based on TRAIN Law tax table
    if (annualGross <= 250000) {
      tax = 0;
    } else if (annualGross <= 400000) {
      tax = (annualGross - 250000) * 0.15;
    } else if (annualGross <= 800000) {
      tax = 22500 + (annualGross - 400000) * 0.20;
    } else if (annualGross <= 2000000) {
      tax = 102500 + (annualGross - 800000) * 0.25;
    } else if (annualGross <= 8000000) {
      tax = 402500 + (annualGross - 2000000) * 0.30;
    } else {
      tax = 2202500 + (annualGross - 8000000) * 0.35;
    }

    // Return monthly tax
    return tax / 12;
  }

  async generatePayslipPDF(payrollId) {
    // This would use PDFKit to generate payslip
    // Implementation depends on your PDF generation library
    // For now, return a placeholder
    return { message: 'PDF generation not yet implemented' };
  }

  async exportPayrollToExcel(periodStart, periodEnd) {
    // This would use ExcelJS to generate Excel report
    // Implementation depends on your Excel generation library
    return { message: 'Excel export not yet implemented' };
  }
}

module.exports = new PayrollService();