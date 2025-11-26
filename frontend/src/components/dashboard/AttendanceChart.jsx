import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AttendanceChart = ({ data = [] }) => {
  // Transform data for the chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    present: parseInt(item.present) || 0,
    absent: parseInt(item.absent) || 0,
    on_leave: parseInt(item.on_leave) || 0
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Attendance Trend (Last 7 Days)</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="present" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Present"
            />
            <Line 
              type="monotone" 
              dataKey="absent" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Absent"
            />
            <Line 
              type="monotone" 
              dataKey="on_leave" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="On Leave"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No attendance data available
        </div>
      )}
    </div>
  );
};