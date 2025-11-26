import { Mail, Phone, Briefcase, Building, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

export const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">
              {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-sm text-gray-600">{employee.employee_id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[employee.employment_status]}`}>
          {employee.employment_status?.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          <span>{employee.position || 'No position'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Building className="w-4 h-4 mr-2" />
          <span>{employee.department || 'No department'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span className="truncate">{employee.email}</span>
        </div>
        {employee.contact_number && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{employee.contact_number}</span>
          </div>
        )}
      </div>

      {employee.basic_salary && (
        <div className="mb-4 pt-4 border-t">
          <p className="text-xs text-gray-600">Basic Salary</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(employee.basic_salary)}
          </p>
        </div>
      )}

      <div className="flex space-x-2 pt-4 border-t">
        <button
          onClick={() => onEdit(employee)}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </button>
        <button
          onClick={() => onDelete(employee.id)}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
};
