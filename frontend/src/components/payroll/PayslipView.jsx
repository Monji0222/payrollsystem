import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { X, Download } from 'lucide-react';
import { Button } from '../common/Button';

export const PayslipView = ({ payroll, onClose }) => {
  const { user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b print:hidden">
          <h2 className="text-xl font-semibold">Payslip</h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Print"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payslip Content */}
        <div className="p-8">
          {/* Company Header */}
          <div className="text-center mb-8 pb-6 border-b-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Company Name</h1>
            <p className="text-sm text-gray-600">Employee Payslip</p>
          </div>

          {/* Employee Information */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
              Employee Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Name</p>
                <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Employee ID</p>
                <p className="font-semibold">{user?.employee_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Position</p>
                <p className="font-semibold">{user?.position}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Department</p>
                <p className="font-semibold">{user?.department}</p>
              </div>
            </div>
          </div>

          {/* Pay Period */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
              Pay Period
            </h3>
            <p className="text-sm">
              {formatDate(payroll.period_start)} - {formatDate(payroll.period_end)}
            </p>
          </div>

          {/* Earnings */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
              Earnings
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm">Basic Salary</span>
                <span className="font-semibold">{formatCurrency(payroll.basic_salary)}</span>
              </div>
              {parseFloat(payroll.overtime_pay) > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm">Overtime Pay</span>
                  <span className="font-semibold">{formatCurrency(payroll.overtime_pay)}</span>
                </div>
              )}
              {parseFloat(payroll.total_allowances) > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm">Allowances</span>
                  <span className="font-semibold">{formatCurrency(payroll.total_allowances)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 bg-gray-50 px-3 rounded">
                <span className="font-semibold">Gross Pay</span>
                <span className="font-bold text-lg">{formatCurrency(payroll.gross_pay)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
              Deductions
            </h3>
            <div className="space-y-3">
              {payroll.details?.filter(d => d.item_type === 'deduction').map((detail, index) => (
                <div key={index} className="flex justify-between py-2 border-b">
                  <span className="text-sm">{detail.item_name}</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(detail.amount)}
                  </span>
                </div>
              ))}
              {!payroll.details?.some(d => d.item_type === 'deduction') && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm">Total Deductions</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(payroll.total_deductions)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-green-700 mb-1">NET PAY</p>
                <p className="text-3xl font-bold text-green-700">
                  {formatCurrency(payroll.net_pay)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
            <p>This is a computer-generated payslip. No signature required.</p>
            <p className="mt-1">Generated on {formatDate(new Date())}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 print:hidden">
          <div className="flex space-x-3">
            <Button onClick={handlePrint} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download / Print
            </Button>
            <Button onClick={onClose} variant="secondary" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
