import { Calendar, Clock, X, Check, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import { Button } from '../common/Button';

export const LeaveCard = ({ leave, onCancel, onApprove, onDecline, showActions = false }) => {
  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      approved: Check,
      declined: XCircle,
      cancelled: X
    };
    return icons[status] || Clock;
  };

  const StatusIcon = getStatusIcon(leave.status);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{leave.leave_type_name}</h3>
            {leave.first_name && (
              <p className="text-sm text-gray-600">
                {leave.first_name} {leave.last_name}
              </p>
            )}
          </div>
        </div>
        <span className={`flex items-center px-2 py-1 text-xs rounded-full ${STATUS_COLORS[leave.status]}`}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {leave.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Start Date:</span>
          <span className="font-semibold">{formatDate(leave.start_date)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">End Date:</span>
          <span className="font-semibold">{formatDate(leave.end_date)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Duration:</span>
          <span className="font-semibold text-blue-600">{leave.total_days} day(s)</span>
        </div>
      </div>

      {leave.reason && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Reason:</p>
          <p className="text-sm text-gray-900">{leave.reason}</p>
        </div>
      )}

      {leave.review_remarks && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">Review Remarks:</p>
          <p className="text-sm text-gray-900">{leave.review_remarks}</p>
          {leave.reviewer_first_name && (
            <p className="text-xs text-gray-600 mt-1">
              by {leave.reviewer_first_name} {leave.reviewer_last_name}
            </p>
          )}
        </div>
      )}

      {leave.status === 'pending' && (
        <div className="flex space-x-2 pt-4 border-t">
          {showActions ? (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(leave.id)}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDecline(leave.id)}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onCancel(leave.id)}
              className="w-full"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel Request
            </Button>
          )}
        </div>
      )}
    </div>
  );
};