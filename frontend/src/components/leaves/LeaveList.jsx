import { Table } from '../common/Table';
import { formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import { X, Check, XCircle } from 'lucide-react';

export const LeaveList = ({ leaves, onCancel, onApprove, onDecline, loading, showActions = false }) => {
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
      key: 'leave_type_name', 
      label: 'Leave Type' 
    },
    { 
      key: 'start_date', 
      label: 'Start Date',
      render: (row) => formatDate(row.start_date)
    },
    { 
      key: 'end_date', 
      label: 'End Date',
      render: (row) => formatDate(row.end_date)
    },
    { 
      key: 'total_days', 
      label: 'Days',
      render: (row) => (
        <span className="font-semibold text-blue-600">{row.total_days} day(s)</span>
      )
    },
    { 
      key: 'reason', 
      label: 'Reason',
      render: (row) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block">
          {row.reason || '-'}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[row.status]}`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.status === 'pending' && (
            showActions ? (
              <>
                <button 
                  onClick={() => onApprove(row.id)}
                  className="text-green-600 hover:text-green-800"
                  title="Approve"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDecline(row.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Decline"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => onCancel(row.id)}
                className="text-red-600 hover:text-red-800"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      )
    }
  ];

  return <Table columns={columns} data={leaves} loading={loading} />;
};