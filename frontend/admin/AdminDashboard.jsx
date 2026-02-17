import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import Calendar from '../components/Calendar';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    pendingLeaves: 0,
    totalPayroll: 0
  });
  const [employees, setEmployees] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load users
    const usersData = JSON.parse(localStorage.getItem('users') || '[]');
    const employeeUsers = usersData.filter(u => u.role === 'employee' || u.role === 'hr' || u.role === 'head');
    setEmployees(employeeUsers.slice(0, 5));
    
    // Load leaves
    const leavesData = JSON.parse(localStorage.getItem('leaves') || '[]');
    setAllLeaves(leavesData);
    setRecentLeaves(leavesData.slice(0, 5));
    
    // Load payrolls
    const payrollData = JSON.parse(localStorage.getItem('payroll') || '[]');
    
    // Load achievements
    const achievementsData = JSON.parse(localStorage.getItem('achievements') || '[]');
    setAchievements(achievementsData);
    
    // Load notifications
    const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(notifs.slice(0, 5));
    
    setStats({
      totalUsers: usersData.length,
      totalEmployees: employeeUsers.length,
      pendingLeaves: leavesData.filter(l => l.status === 'pending').length,
      totalPayroll: payrollData.length
    });
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AdminLayout>
      <div className="dashboard">
        <h2 className="dashboard-title">Dashboard</h2>
        <p className="welcome-text">Welcome back, {currentUser.name || 'Administrator'}!</p>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon blue">👥</div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">👤</div>
            <div className="stat-info">
              <h3>{stats.totalEmployees}</h3>
              <p>Total Employees</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">📅</div>
            <div className="stat-info">
              <h3>{stats.pendingLeaves}</h3>
              <p>Pending Leaves</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">💰</div>
            <div className="stat-info">
              <h3>{stats.totalPayroll}</h3>
              <p>Payroll Records</p>
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="notifications-panel">
            <div className="notifications-header">
              <h3 className="panel-title">Notifications</h3>
              {unreadCount > 0 && <span className="notification-badge">{unreadCount} new</span>}
            </div>
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div key={notif.id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                  <div className={`notification-icon ${notif.type}`}>
                    {notif.type === 'leave_request' ? '📅' : '🏆'}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">{new Date(notif.date).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Employee Overview Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Employee Overview</h3>
            </div>
            <div className="panel-content">
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <div key={emp.id} className="employee-card">
                    <div className="emp-photo">
                      {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <div className="emp-details">
                      <div className="emp-name">{emp.name}</div>
                      <div className="emp-position">{emp.email}</div>
                    </div>
                    <span className={`role-badge ${emp.role}`}>
                      {emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No employees yet. Add employees from User Management.
                </div>
              )}
            </div>
          </div>

          {/* Recent Leave Request Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Recent Leave Request</h3>
              <a href="/admin/leaves" style={{ fontSize: '13px', color: '#1a365d', textDecoration: 'none' }}>View All →</a>
            </div>
            <div className="panel-content">
              {recentLeaves.length > 0 ? (
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>{leave.employeeName}</td>
                        <td>{leave.leaveType}</td>
                        <td>{leave.daysRequested}</td>
                        <td>
                          <span className={`status-badge ${leave.status}`}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No leave requests yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="dashboard-panel" style={{ marginTop: '24px' }}>
          <div className="panel-header">
            <h3 className="panel-title">Leave Calendar</h3>
          </div>
          <div className="panel-content">
            <Calendar leaves={allLeaves} />
          </div>
        </div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <div className="dashboard-panel" style={{ marginTop: '24px' }}>
            <div className="panel-header">
              <h3 className="panel-title">Recent Achievements</h3>
            </div>
            <div className="panel-content">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.slice(0, 5).map((achievement) => (
                    <tr key={achievement.id}>
                      <td>{achievement.employeeName}</td>
                      <td>{achievement.title}</td>
                      <td>{achievement.date}</td>
                      <td>
                        <span className={`status-badge ${achievement.status}`}>
                          {achievement.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
