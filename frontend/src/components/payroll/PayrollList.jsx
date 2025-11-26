import { Table } from '../common/Table';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import { FileText, Check } from 'lucide-react';

export const PayrollList = ({ payrolls, onViewPayslip, onApprove, loading, showActions = false }) => {
  const columns = [
    ...(showActions ? [{
      key: 'employee',
      label: 'Employee',
      render: (row) => (
        <div>
          <p className="font-semibold">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-gray-600">{row.employee_id}</p>
        </div>
      )
    }] : []),
    { 
      key: 'period', 
      label: 'Period',
      render: (row) => (
        <div className="text-sm">
          <div>{formatDate(row.period_start)}</div>
          <div className="text-gray-500">to {formatDate(row.period_end)}</div>
        </div>
      )
    },
    { 
      key: 'basic_salary', 
      label: 'Basic Salary',
      render: (row) => formatCurrency(row.basic_salary)
    },
    { 
      key: 'gross_pay', 
      label: 'Gross Pay',
      render: (row) => formatCurrency(row.gross_pay)
    },
    { 
      key: 'total_deductions', 
      label: 'Deductions',
      render: (row) => (
        <span className="text-red-600">{formatCurrency(row.total_deductions)}</span>
      )
    },
    { 
      key: 'net_pay', 
      label: 'Net Pay',
      render: (row) => (
        <span className="font-bold text-green-600">
          {formatCurrency(row.net_pay)}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[row.status]}`}>
          {row.status.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => onViewPayslip(row)}
            className="text-blue-600 hover:text-blue-800"
            title="View Payslip"
          >
            <FileText className="w-4 h-4" />
          </button>
          {showActions && row.status === 'draft' && (
            <button 
              onClick={() => onApprove(row.id)}
              className="text-green-600 hover:text-green-800"
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return <Table columns={columns} data={payrolls} loading={loading} />;
};
