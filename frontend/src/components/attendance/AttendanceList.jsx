import { Table } from '../common/Table';
import { formatDate, formatTime } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

export const AttendanceList = ({ attendance, loading }) => {
  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (row) => formatDate(row.date)
    },
    { 
      key: 'time_in', 
      label: 'Time In',
      render: (row) => formatTime(row.time_in) || '-'
    },
    { 
      key: 'time_out', 
      label: 'Time Out',
      render: (row) => formatTime(row.time_out) || '-'
    },
    { 
      key: 'total_hours', 
      label: 'Total Hours',
      render: (row) => row.total_hours ? `${parseFloat(row.total_hours).toFixed(2)} hrs` : '-'
    },
    { 
      key: 'overtime_hours', 
      label: 'Overtime',
      render: (row) => {
        const overtime = parseFloat(row.overtime_hours || 0);
        return overtime > 0 ? (
          <span className="text-purple-600 font-semibold">
            {overtime.toFixed(2)} hrs
          </span>
        ) : '-';
      }
    },
    { 
      key: 'late_minutes', 
      label: 'Late',
      render: (row) => {
        const late = parseInt(row.late_minutes || 0);
        return late > 0 ? (
          <span className="text-red-600 font-semibold">
            {late} min
          </span>
        ) : '-';
      }
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
      key: 'remarks',
      label: 'Remarks',
      render: (row) => row.remarks ? (
        <span className="text-sm text-gray-600">{row.remarks}</span>
      ) : '-'
    }
  ];

  return <Table columns={columns} data={attendance} loading={loading} />;
};
