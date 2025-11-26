import { formatDateTime } from '../../utils/formatters';
import { Clock, UserPlus, Calendar, DollarSign, AlertCircle } from 'lucide-react';

export const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (action) => {
    const icons = {
      'LOGIN': Clock,
      'LOGOUT': Clock,
      'CREATE_USER': UserPlus,
      'TIME_IN': Clock,
      'TIME_OUT': Clock,
      'CREATE_LEAVE_REQUEST': Calendar,
      'APPROVE_LEAVE': Calendar,
      'GENERATE_PAYROLL': DollarSign,
      'APPROVE_PAYROLL': DollarSign
    };
    
    const Icon = icons[action] || AlertCircle;
    return Icon;
  };

  const getActivityColor = (action) => {
    const colors = {
      'LOGIN': 'text-green-600 bg-green-100',
      'LOGOUT': 'text-gray-600 bg-gray-100',
      'CREATE_USER': 'text-blue-600 bg-blue-100',
      'TIME_IN': 'text-green-600 bg-green-100',
      'TIME_OUT': 'text-orange-600 bg-orange-100',
      'CREATE_LEAVE_REQUEST': 'text-purple-600 bg-purple-100',
      'APPROVE_LEAVE': 'text-green-600 bg-green-100',
      'GENERATE_PAYROLL': 'text-blue-600 bg-blue-100',
      'APPROVE_PAYROLL': 'text-green-600 bg-green-100'
    };
    
    return colors[action] || 'text-gray-600 bg-gray-100';
  };

  const formatAction = (action) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      {activities.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.action);
            const colorClass = getActivityColor(activity.action);
            
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`${colorClass} p-2 rounded-full`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.first_name} {activity.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatAction(activity.action)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(activity.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No recent activity
        </div>
      )}
    </div>
  );
};