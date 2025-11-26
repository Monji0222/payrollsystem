// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardStats, getEmployeeStats } from '../api/dashboardApi';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { Users, Clock, Calendar, DollarSign, TrendingUp, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { StatsCard } from '../components/dashboard/StatsCard';
import { AttendanceChart } from '../components/dashboard/AttendanceChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user.role === 'admin' || user.role === 'hr') {
        const response = await getDashboardStats();
        setStats(response.data);
      } else {
        const response = await getEmployeeStats();
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quick Actions for Admin/HR
  const adminQuickActions = [
    {
      title: 'View All Employees',
      description: 'Manage employee records',
      icon: Users,
      color: 'blue',
      onClick: () => navigate('/employees')
    },
    {
      title: 'Process Payroll',
      description: 'Generate employee payroll',
      icon: DollarSign,
      color: 'green',
      onClick: () => navigate('/payroll')
    },
    {
      title: 'Review Leave Requests',
      description: `${stats?.pendingLeaves || 0} pending requests`,
      icon: Calendar,
      color: 'yellow',
      onClick: () => navigate('/leaves')
    },
    {
      title: 'Attendance Report',
      description: 'View attendance summary',
      icon: FileText,
      color: 'purple',
      onClick: () => navigate('/attendance')
    }
  ];

  // Quick Actions for Employees
  const employeeQuickActions = [
    {
      title: 'Clock In/Out',
      description: 'Record your attendance',
      icon: Clock,
      color: 'blue',
      onClick: () => navigate('/attendance')
    },
    {
      title: 'Request Leave',
      description: 'Submit a leave request',
      icon: Calendar,
      color: 'green',
      onClick: () => navigate('/leaves')
    },
    {
      title: 'View Payslips',
      description: 'Access your payroll history',
      icon: DollarSign,
      color: 'purple',
      onClick: () => navigate('/payroll')
    },
    {
      title: 'My Profile',
      description: 'Update your information',
      icon: Users,
      color: 'orange',
      onClick: () => navigate('/profile')
    }
  ];

  const quickActions = user.role === 'admin' || user.role === 'hr' 
    ? adminQuickActions 
    : employeeQuickActions;

  if (loading) {
    return <Loading fullScreen />;
  }

  // Admin/HR Dashboard
  if (user.role === 'admin' || user.role === 'hr') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.first_name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Present Today"
            value={stats?.presentToday || 0}
            icon={Clock}
            color="green"
          />
          <StatsCard
            title="Pending Leaves"
            value={stats?.pendingLeaves || 0}
            icon={Calendar}
            color="yellow"
          />
          <StatsCard
            title="Monthly Payroll"
            value={formatCurrency(stats?.monthlyPayroll || 0)}
            icon={DollarSign}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
                green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
                yellow: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200',
                purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
                orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'
              };

              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${colorClasses[action.color]}`}
                >
                  <div className="flex items-center mb-2">
                    <Icon className="w-5 h-5 mr-2" />
                    <h3 className="font-semibold">{action.title}</h3>
                  </div>
                  <p className="text-sm opacity-80">{action.description}</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Charts and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceChart data={stats?.attendanceData} />
          
          <Card title="Department Distribution">
            {stats?.departmentDistribution && stats.departmentDistribution.length > 0 ? (
              <div className="space-y-3">
                {stats.departmentDistribution.map((dept, index) => {
                  const total = stats.totalEmployees;
                  const percentage = total > 0 ? ((dept.count / total) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {dept.department || 'Unassigned'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {dept.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </Card>
        </div>

        {/* Recent Activities */}
        {stats?.recentActivities && stats.recentActivities.length > 0 && (
          <div className="mt-6">
            <RecentActivity activities={stats.recentActivities} />
          </div>
        )}
      </div>
    );
  }

  // Employee Dashboard
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.first_name}!</p>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Present Days"
          value={stats?.attendance?.present_days || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Total Hours"
          value={parseFloat(stats?.attendance?.total_hours || 0).toFixed(1)}
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Overtime Hours"
          value={parseFloat(stats?.attendance?.overtime_hours || 0).toFixed(1)}
          icon={TrendingUp}
          color="purple"
        />
        <StatsCard
          title="Pending Leaves"
          value={stats?.pendingLeaves || 0}
          icon={AlertCircle}
          color="yellow"
        />
      </div>

      {/* Quick Actions for Employees */}
      <Card title="Quick Actions" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
              green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
              yellow: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200',
              purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
              orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'
            };

            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${colorClasses[action.color]}`}
              >
                <div className="flex items-center mb-2">
                  <Icon className="w-5 h-5 mr-2" />
                  <h3 className="font-semibold">{action.title}</h3>
                </div>
                <p className="text-sm opacity-80">{action.description}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Employee Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Leave Credits">
          {stats?.leaveCredits && stats.leaveCredits.length > 0 ? (
            <div className="space-y-3">
              {stats.leaveCredits.map((credit, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{credit.leave_type_name}</p>
                    <p className="text-xs text-gray-600">
                      Used: {credit.used_credits} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {credit.remaining_credits}
                    </p>
                    <p className="text-xs text-gray-600">
                      of {credit.total_credits} days
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No leave credits available</p>
          )}
        </Card>

        <Card title="Latest Payslip">
          {stats?.latestPayroll ? (
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Period:</span>
                <span className="font-semibold text-sm">
                  {new Date(stats.latestPayroll.period_start).toLocaleDateString()} - {' '}
                  {new Date(stats.latestPayroll.period_end).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Gross Pay:</span>
                <span className="font-semibold">{formatCurrency(stats.latestPayroll.gross_pay)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Deductions:</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats.latestPayroll.total_deductions)}
                </span>
              </div>
              <div className="flex justify-between py-3 bg-green-50 px-3 rounded-lg">
                <span className="font-semibold text-gray-900">Net Pay:</span>
                <span className="font-bold text-green-600 text-xl">
                  {formatCurrency(stats.latestPayroll.net_pay)}
                </span>
              </div>
              <button
                onClick={() => navigate('/payroll')}
                className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Payslips
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No payslip available yet</p>
              <button
                onClick={() => navigate('/payroll')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check Payroll
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};