import { useState, useEffect } from 'react';
import { getMyPayroll, getPayroll } from '../api/payrollApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { PayrollList } from '../components/payroll/PayrollList';
import { PayslipView } from '../components/payroll/PayslipView';
import toast from 'react-hot-toast';
import { DollarSign, FileText, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';

export const Payroll = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    month: '',
    year: new Date().getFullYear().toString()
  });

  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    fetchPayroll();
  }, [filters]);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const response = isAdminOrHR 
        ? await getPayroll(filters)
        : await getMyPayroll(filters);
      setPayrolls(response.data.payrolls);
    } catch (error) {
      toast.error('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = (payroll) => {
    setSelectedPayroll(payroll);
  };

  // Export to Excel
  const handleExportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = payrolls.map(payroll => ({
        'Employee ID': payroll.employee_id || '-',
        'Employee Name': payroll.first_name && payroll.last_name 
          ? `${payroll.first_name} ${payroll.last_name}` 
          : user.first_name + ' ' + user.last_name,
        'Position': payroll.position || user.position,
        'Period Start': formatDate(payroll.period_start),
        'Period End': formatDate(payroll.period_end),
        'Basic Salary': parseFloat(payroll.basic_salary),
        'Overtime Pay': parseFloat(payroll.overtime_pay),
        'Allowances': parseFloat(payroll.total_allowances),
        'Gross Pay': parseFloat(payroll.gross_pay),
        'Deductions': parseFloat(payroll.total_deductions),
        'Net Pay': parseFloat(payroll.net_pay),
        'Status': payroll.status.toUpperCase()
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, // Employee ID
        { wch: 20 }, // Employee Name
        { wch: 20 }, // Position
        { wch: 15 }, // Period Start
        { wch: 15 }, // Period End
        { wch: 15 }, // Basic Salary
        { wch: 12 }, // Overtime
        { wch: 12 }, // Allowances
        { wch: 15 }, // Gross Pay
        { wch: 12 }, // Deductions
        { wch: 15 }, // Net Pay
        { wch: 12 }  // Status
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Payroll');

      // Generate filename
      const filename = `Payroll_Report_${filters.year || 'All'}_${new Date().getTime()}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export to Excel');
    }
  };

  // Print Payroll List
  const handlePrintList = () => {
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payroll Report - ${filters.year || 'All Years'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .header h1 {
            margin: 0;
            color: #2563eb;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            text-align: left;
          }
          th {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .total-row {
            font-weight: bold;
            background-color: #e5e7eb !important;
          }
          .amount {
            text-align: right;
          }
          .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
            display: inline-block;
          }
          .status-approved {
            background-color: #dcfce7;
            color: #166534;
          }
          .status-pending {
            background-color: #fef3c7;
            color: #92400e;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.875rem;
            color: #666;
          }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Company Name</h1>
          <h2>Payroll Report</h2>
          <p>Generated on: ${formatDate(new Date())}</p>
          ${filters.year ? `<p>Year: ${filters.year}</p>` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              ${isAdminOrHR ? '<th>Employee</th>' : ''}
              <th>Period</th>
              <th class="amount">Basic Salary</th>
              <th class="amount">Gross Pay</th>
              <th class="amount">Deductions</th>
              <th class="amount">Net Pay</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${payrolls.map(p => `
              <tr>
                ${isAdminOrHR ? `<td>${p.first_name} ${p.last_name}<br><small>${p.employee_id}</small></td>` : ''}
                <td>${formatDate(p.period_start)} - ${formatDate(p.period_end)}</td>
                <td class="amount">${formatCurrency(p.basic_salary)}</td>
                <td class="amount">${formatCurrency(p.gross_pay)}</td>
                <td class="amount">${formatCurrency(p.total_deductions)}</td>
                <td class="amount"><strong>${formatCurrency(p.net_pay)}</strong></td>
                <td><span class="status status-${p.status}">${p.status.toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              ${isAdminOrHR ? '<td colspan="2">TOTAL</td>' : '<td>TOTAL</td>'}
              <td class="amount">${formatCurrency(payrolls.reduce((sum, p) => sum + parseFloat(p.basic_salary), 0))}</td>
              <td class="amount">${formatCurrency(payrolls.reduce((sum, p) => sum + parseFloat(p.gross_pay), 0))}</td>
              <td class="amount">${formatCurrency(payrolls.reduce((sum, p) => sum + parseFloat(p.total_deductions), 0))}</td>
              <td class="amount"><strong>${formatCurrency(payrolls.reduce((sum, p) => sum + parseFloat(p.net_pay), 0))}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer">
          <p>This is a computer-generated report. No signature required.</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Calculate totals
  const totals = {
    basicSalary: payrolls.reduce((sum, p) => sum + parseFloat(p.basic_salary || 0), 0),
    grossPay: payrolls.reduce((sum, p) => sum + parseFloat(p.gross_pay || 0), 0),
    deductions: payrolls.reduce((sum, p) => sum + parseFloat(p.total_deductions || 0), 0),
    netPay: payrolls.reduce((sum, p) => sum + parseFloat(p.net_pay || 0), 0)
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <DollarSign className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">
              {isAdminOrHR ? 'Payroll Management' : 'My Payroll'}
            </h1>
            <p className="text-gray-600 text-sm">
              {isAdminOrHR ? 'Manage employee payroll records' : 'View your payment history'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {payrolls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-sm text-gray-600 mb-1">Total Basic Salary</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(totals.basicSalary)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Total Gross Pay</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(totals.grossPay)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Total Deductions</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(totals.deductions)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Total Net Pay</p>
            <p className="text-xl font-bold text-purple-600">
              {formatCurrency(totals.netPay)}
            </p>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className="input w-32"
            >
              <option value="">All Years</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="input w-40"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="processed">Processed</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handlePrintList}
              variant="secondary"
              disabled={payrolls.length === 0}
              className="flex items-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={handleExportToExcel}
              disabled={payrolls.length === 0}
              className="flex items-center"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Payroll Table */}
      <Card>
        <PayrollList
          payrolls={payrolls}
          onViewPayslip={handleViewPayslip}
          loading={loading}
          showActions={isAdminOrHR}
        />
      </Card>

      {/* Payslip Modal */}
      {selectedPayroll && (
        <PayslipView
          payroll={selectedPayroll}
          onClose={() => setSelectedPayroll(null)}
        />
      )}
    </div>
  );
};