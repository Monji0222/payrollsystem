import { Table } from '../common/Table';
import { STATUS_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { Pencil, Trash2 } from 'lucide-react';

export const EmployeeList = ({ employees, onEdit, onDelete, loading }) => {
  const columns = [
    { 
      key: 'employee_id', 
      label: 'Employee ID' 
    },
    { 
      key: 'name', 
      label: 'Name',
      render: (row) => `${row.first_name} ${row.last_name}`
    },
    { 
      key: 'email', 
      label: 'Email' 
    },
    { 
      key: 'position', 
      label: 'Position',
      render: (row) => row.position || '-'
    },
    { 
      key: 'department', 
      label: 'Department',
      render: (row) => row.department || '-'
    },
    { 
      key: 'basic_salary', 
      label: 'Salary',
      render: (row) => row.basic_salary ? formatCurrency(row.basic_salary) : '-'
    },
    { 
      key: 'role', 
      label: 'Role',
      render: (row) => (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
          {row.role}
        </span>
      )
    },
    { 
      key: 'employment_status', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[row.employment_status]}`}>
          {row.employment_status?.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(row)} 
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(row.id)} 
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return <Table columns={columns} data={employees} loading={loading} />;
};