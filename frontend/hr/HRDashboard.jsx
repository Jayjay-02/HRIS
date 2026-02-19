import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import './HRDashboard.css';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'hr') {
      navigate('/login');
      return;
    }
    setUser(userData);
    setProfileForm({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || ''
    });
    
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadData = () => {
    const allNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    // HR sees only leave and achievement notifications
    const hrNotifs = allNotifs.filter(n => n.type === 'leave' || n.type === 'achievement');
    setNotifications(hrNotifs);
    setLeaves(JSON.parse(localStorage.getItem('leaves') || '[]'));
    setPayrolls(JSON.parse(localStorage.getItem('payroll') || '[]'));
    setEmployees(JSON.parse(localStorage.getItem('users') || '[]').filter(u => u.role === 'employee'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileSave = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, ...profileForm } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    const updatedUser = { ...user, ...profileForm };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowProfileModal(false);
    alert('Profile updated successfully!');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const markAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  return (
    <div className="hr-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src="/assets/lto.png" alt="LTO" />
            <span>LTO IHREMS</span>
          </div>
        </div>
        <nav>
          <Link to="/hr/dashboard" className="nav-item active">📊 Dashboard</Link>
          <Link to="/hr/users" className="nav-item">👥 User Management</Link>
          <Link to="/hr/employees" className="nav-item">👤 Employees</Link>
          <Link to="/hr/leaves" className="nav-item">📅 Leave Requests</Link>
          <Link to="/hr/logs" className="nav-item">📝 Logs</Link>
          <Link to="/hr/settings" className="nav-item">⚙️ Settings</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <header>
          <h1>HR Dashboard</h1>
          <div className="header-right">
            <div className="notification-bell-wrapper">
              <button 
                className="notification-bell" 
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown) markAsRead();
                }}
              >
                🔔
                {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
              </button>
              {showNotifDropdown && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <span>Notifications</span>
                  </div>
                  <div className="dropdown-content">
                    {notifications.length === 0 ? (
                      <div className="empty-notifications">No notifications</div>
                    ) : (
                      notifications.slice(0, 10).map((notif, index) => (
                        <div key={index} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                          <div className="notif-icon">
                            {notif.type === 'leave' ? '📅' : notif.type === 'achievement' ? '🏆' : '📢'}
                          </div>
                          <div className="notif-body">
                            <p>{notif.message}</p>
                            <span className="notif-time">{formatTimeAgo(notif.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="profile-btn" onClick={() => setShowProfileModal(true)}>
              <div className="avatar">{user.name?.charAt(0)}</div>
            </button>
          </div>
        </header>

        <div className="content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{employees.length}</div>
              <div className="stat-label">Employees</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">{leaves.filter(l => l.status === 'pending').length}</div>
              <div className="stat-label">Pending Leaves</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">{payrolls.length}</div>
              <div className="stat-label">Payroll Records</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{leaves.filter(l => l.status === 'approved').length}</div>
              <div className="stat-label">Approved Leaves</div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Leave Calendar */}
            <div className="panel">
              <h3>📅 Leave Calendar</h3>
              <Calendar leaves={leaves} />
            </div>

            {/* Recent Leave Requests */}
            <div className="panel">
              <h3>📋 Recent Leave Requests</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.slice(0, 5).map(leave => (
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
            </div>
          </div>

          {/* Reports Section */}
          <div className="panel full-width">
            <h3>📊 Reports</h3>
            <div className="reports-grid">
              <div className="report-card">
                <h4>Employee Summary</h4>
                <p>Total Employees: {employees.length}</p>
              </div>
              <div className="report-card">
                <h4>Leave Summary</h4>
                <p>Pending: {leaves.filter(l => l.status === 'pending').length}</p>
                <p>Approved: {leaves.filter(l => l.status === 'approved').length}</p>
              </div>
              <div className="report-card">
                <h4>Payroll Summary</h4>
                <p>Total Records: {payrolls.length}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>My Profile</h3>
              <button onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleProfileSave}>Save Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
