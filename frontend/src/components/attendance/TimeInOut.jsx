import { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { formatTime } from '../../utils/formatters';

export const TimeInOut = ({ todayAttendance, onTimeIn, onTimeOut, loading }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const hasTimedIn = todayAttendance?.time_in;
  const hasTimedOut = todayAttendance?.time_out;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
          <Clock className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {formatCurrentTime()}
        </h3>
        <p className="text-gray-600">{formatCurrentDate()}</p>
      </div>

      <div className="bg-white rounded-lg p-6 mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Today's Status</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Time In:</span>
            <span className="font-semibold text-gray-900">
              {hasTimedIn ? formatTime(todayAttendance.time_in) : 'Not yet'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Time Out:</span>
            <span className="font-semibold text-gray-900">
              {hasTimedOut ? formatTime(todayAttendance.time_out) : 'Not yet'}
            </span>
          </div>
          {todayAttendance?.total_hours && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">Total Hours:</span>
              <span className="font-bold text-blue-600">
                {parseFloat(todayAttendance.total_hours).toFixed(2)} hrs
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {!hasTimedIn && (
          <Button
            onClick={onTimeIn}
            disabled={loading}
            className="w-full"
          >
            <Clock className="w-5 h-5 mr-2" />
            {loading ? 'Processing...' : 'Time In'}
          </Button>
        )}

        {hasTimedIn && !hasTimedOut && (
          <Button
            onClick={onTimeOut}
            disabled={loading}
            variant="secondary"
            className="w-full"
          >
            <Clock className="w-5 h-5 mr-2" />
            {loading ? 'Processing...' : 'Time Out'}
          </Button>
        )}

        {hasTimedOut && (
          <div className="flex items-center justify-center text-green-600 py-3">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">Completed for today!</span>
          </div>
        )}
      </div>
    </div>
  );
};
