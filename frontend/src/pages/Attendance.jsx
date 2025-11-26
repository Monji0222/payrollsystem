import { useState, useEffect } from 'react';
import { getMyAttendance, timeIn, timeOut } from '../api/attendanceApi';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Clock, Calendar } from 'lucide-react';
import { formatTime, formatDate } from '../utils/formatters';
import { STATUS_COLORS } from '../utils/constants';

export const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await getMyAttendance();
      setAttendance(response.data.attendance);
      
      // Find today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = response.data.attendance.find(a => a.date === today);
      setTodayAttendance(todayRecord);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeIn = async () => {
    try {
      await timeIn();
      toast.success('Timed in successfully!');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to time in');
    }
  };

  const handleTimeOut = async () => {
    try {
      await timeOut();
      toast.success('Timed out successfully!');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to time out');
    }
  };

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
      render: (row) => row.overtime_hours ? `${parseFloat(row.overtime_hours).toFixed(2)} hrs` : '-'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[row.status]}`}>
          {row.status.replace('_', ' ').toUpperCase()}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Attendance</h1>

      {/* Time In/Out Card */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Today's Attendance</h3>
            <div className="space-y-1">
              {todayAttendance ? (
                <>
                  <p className="text-sm text-gray-600">
                    Time In: <span className="font-semibold">{formatTime(todayAttendance.time_in) || 'Not yet'}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Time Out: <span className="font-semibold">{formatTime(todayAttendance.time_out) || 'Not yet'}</span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-600">No attendance record for today</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            {!todayAttendance?.time_in && (
              <Button onClick={handleTimeIn}>
                <Clock className="w-4 h-4 inline mr-2" />
                Time In
              </Button>
            )}
            
            {todayAttendance?.time_in && !todayAttendance?.time_out && (
              <Button onClick={handleTimeOut}>
                <Clock className="w-4 h-4 inline mr-2" />
                Time Out
              </Button>
            )}
            
            {todayAttendance?.time_out && (
              <div className="text-green-600 font-semibold">
                ✓ Completed for today
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Attendance History */}
      <Card title="Attendance History">
        <Table columns={columns} data={attendance} loading={loading} />
      </Card>
    </div>
  );
};
