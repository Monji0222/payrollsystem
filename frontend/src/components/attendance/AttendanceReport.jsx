export const AttendanceReport = ({ summary }) => {
  if (!summary) return null;

  const stats = [
    { label: 'Total Days', value: summary.totalDays, color: 'blue' },
    { label: 'Present', value: summary.presentDays, color: 'green' },
    { label: 'Late', value: summary.lateDays, color: 'yellow' },
    { label: 'Absent', value: summary.absentDays, color: 'red' },
    { label: 'Half Days', value: summary.halfDays, color: 'orange' },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`${colorClasses[stat.color]} rounded-lg p-4`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Hours</p>
          <p className="text-xl font-bold text-blue-600">
            {parseFloat(summary.totalHours || 0).toFixed(2)} hrs
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Overtime Hours</p>
          <p className="text-xl font-bold text-purple-600">
            {parseFloat(summary.totalOvertimeHours || 0).toFixed(2)} hrs
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Late</p>
          <p className="text-xl font-bold text-red-600">
            {parseInt(summary.totalLateMinutes || 0)} min
          </p>
        </div>
      </div>
    </div>
  );
};