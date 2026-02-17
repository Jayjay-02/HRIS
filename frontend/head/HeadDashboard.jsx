import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import Modal from '../components/Modal';
import './HeadDashboard.css';

const HeadDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info', action: null });
  const [pendingAction, setPendingAction] = useState({ id: null, status: null, leave: null });
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'head') {
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
    // Chief sees leave notifications that need approval
    const headNotifs = allNotifs.filter(n => n.type === 'leave' && !n.chiefApproved);
    setNotifications(headNotifs);
    setUsers(JSON.parse(localStorage.getItem('users') || '[]'));
    setLeaves(JSON.parse(localStorage.getItem('leaves') || '[]'));
    setPayrolls(JSON.parse(localStorage.getItem('payroll') || '[]'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileSave = () => {
    const usersList = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = usersList.map(u => 
      u.id === user.id ? { ...u, ...profileForm } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    const updatedUser = { ...user, ...profileForm };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowProfileModal(false);
    alert('Profile updated successfully!');
  };

  const employees = users.filter(u => u.role === 'employee');
  const totalSalary = payrolls.reduce((sum, p) => sum + (parseFloat(p.netSalary) || 0), 0);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
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

  // CSV Export Functions
  const convertToCSV = (data, headers) => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    data.forEach(row => {
      const values = headers.map(header => {
        const key = header.toLowerCase().replace(/ /g, '');
        let value = row[key] || row[header] || '';
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
          if (value.includes(',') || value.includes('"')) {
            value = `"${value}"`;
          }
        }
        return value;
      });
      csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportEmployees = () => {
    const userData = users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Position: u.position || '',
      Role: u.role
    }));
    const headers = ['ID', 'Name', 'Email', 'Position', 'Role'];
    const csv = convertToCSV(userData, headers);
    downloadCSV(csv, 'employees');
  };

  const exportLeaves = () => {
    const leaveData = leaves.map(l => ({
      ID: l.id,
      Employee: l.employeeName,
      Type: l.leaveType,
      StartDate: l.startDate,
      EndDate: l.endDate,
      Days: l.daysRequested,
      Status: l.status
    }));
    const headers = ['ID', 'Employee', 'Type', 'StartDate', 'EndDate', 'Days', 'Status'];
    const csv = convertToCSV(leaveData, headers);
    downloadCSV(csv, 'leaves');
  };

  const exportPayroll = () => {
    const payrollData = payrolls.map(p => ({
      ID: p.id,
      Employee: p.employeeName,
      Period: p.period,
      BasicSalary: p.basicSalary,
      Deductions: p.deductions,
      NetSalary: p.netSalary
    }));
    const headers = ['ID', 'Employee', 'Period', 'BasicSalary', 'Deductions', 'NetSalary'];
    const csv = convertToCSV(payrollData, headers);
    downloadCSV(csv, 'payroll');
  };

  const exportAll = () => {
    const allData = [
      { Section: 'EMPLOYEES', data: users.map(u => ({ Name: u.name, Email: u.email, Position: u.position || '', Role: u.role })) },
      { Section: 'LEAVES', data: leaves.map(l => ({ Employee: l.employeeName, Type: l.leaveType, Status: l.status })) },
      { Section: 'PAYROLL', data: payrolls.map(p => ({ Employee: p.employeeName, NetSalary: p.netSalary })) }
    ];
    let csvContent = '';
    allData.forEach(section => {
      csvContent += `\n${section.Section}\n`;
      if (section.data.length > 0) {
        const headers = Object.keys(section.data[0]);
        csvContent += headers.join(',') + '\n';
        section.data.forEach(row => {
          csvContent += headers.map(h => row[h] || '').join(',') + '\n';
        });
      }
    });
    downloadCSV(csvContent, 'head_report');
  };

  const confirmExport = (action, title, message) => {
    setModalContent({ title, message, type: 'confirm', action });
    setShowConfirmModal(true);
  };

  const executeExport = () => {
    if (modalContent.action) {
      modalContent.action();
    }
    setShowConfirmModal(false);
  };

  // Leave Approval Functions
  const confirmLeaveAction = (id, status) => {
    const leave = leaves.find(l => l.id === id);
    setPendingAction({ id, status, leave });
    
    if (status === 'chief_approved') {
      setModalContent({
        title: 'Approve Leave Request',
        message: `Are you sure you want to APPROVE this leave request for ${leave?.employeeName}? This will forward the request to Admin for final approval.`,
        type: 'confirm',
        confirmText: 'Yes, Approve',
        cancelText: 'Cancel',
        action: 'approve'
      });
    } else {
      setModalContent({
        title: 'Decline Leave Request',
        message: `Are you sure you want to DECLINE this leave request for ${leave?.employeeName}?`,
        type: 'danger',
        confirmText: 'Yes, Decline',
        cancelText: 'Cancel',
        action: 'reject'
      });
    }
    setShowConfirmModal(true);
  };

  const executeLeaveAction = () => {
    const { id, status, leave } = pendingAction;
    
    if (status === 'chief_approved') {
      // Update leave with chief approval
      const updatedLeaves = leaves.map(l => 
        l.id === id ? { ...l, chiefApproved: true, chiefApprover: user.name } : l
      );
      localStorage.setItem('leaves', JSON.stringify(updatedLeaves));
      setLeaves(updatedLeaves);
      
      // Notify Admin
      const admins = JSON.parse(localStorage.getItem('users') || '[]').filter(u => u.role === 'admin');
      const adminNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      admins.forEach(admin => {
        adminNotifications.push({
          id: Date.now() + admin.id,
          type: 'leave',
          title: 'Leave Approved by Chief',
          message: `${leave?.employeeName}'s leave request for ${leave?.daysRequested} days has been APPROVED by the Chief. Please review for final approval.`,
          userId: admin.id,
          targetUserId: leave?.employeeId,
          leaveId: leave?.id,
          chiefApproved: true,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      });
      localStorage.setItem('notifications', JSON.stringify(adminNotifications));
      
      // Notify Employee
      const employeeNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      employeeNotifications.push({
        id: Date.now() + 'emp',
        type: 'leave_response',
        title: 'Leave Approved by Chief',
        message: `Your leave request for ${leave?.daysRequested} days has been APPROVED by the Chief. It is now pending Admin's final approval.`,
        userId: leave?.employeeId,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('notifications', JSON.stringify(employeeNotifications));
      
      // Log activity
      const activities = JSON.parse(localStorage.getItem('activities') || '[]');
      activities.unshift({
        action: `Chief approved leave request for ${leave?.employeeName} (${leave?.daysRequested} days)`,
        user: leave?.employeeName,
        date: new Date().toLocaleDateString(),
        status: 'pending'
      });
      localStorage.setItem('activities', JSON.stringify(activities));
      
      setModalContent({
        title: 'Leave Approved',
        message: `Leave request for ${leave?.employeeName} has been approved and forwarded to Admin for final approval.`,
        type: 'success'
      });
    } else {
      // Reject
      const updatedLeaves = leaves.map(l => 
        l.id === id ? { ...l, status: 'rejected', chiefApproved: false } : l
      );
      localStorage.setItem('leaves', JSON.stringify(updatedLeaves));
      setLeaves(updatedLeaves);
      
      // Notify Employee
      const employeeNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      employeeNotifications.push({
        id: Date.now() + 'emp',
        type: 'leave_response',
        title: 'Leave Declined',
        message: `Your leave request for ${leave?.daysRequested} days has been declined by the Chief.`,
        userId: leave?.employeeId,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('notifications', JSON.stringify(employeeNotifications));
      
      // Log activity
      const activities = JSON.parse(localStorage.getItem('activities') || '[]');
      activities.unshift({
        action: `Chief declined leave request for ${leave?.employeeName}`,
        user: leave?.employeeName,
        date: new Date().toLocaleDateString(),
        status: 'completed'
      });
      localStorage.setItem('activities', JSON.stringify(activities));
      
      setModalContent({
        title: 'Leave Declined',
        message: `Leave request for ${leave?.employeeName} has been declined.`,
        type: 'success'
      });
    }
    
    setShowModal(true);
    setShowConfirmModal(false);
  };

  return (
    <div className="head-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src="/assets/lto.png" alt="LTO" />
            <span>LTO IHREMS</span>
          </div>
        </div>
        <nav>
          <button 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveSection('reports')}
          >
            📈 Reports
          </button>
          <button 
            className={`nav-item ${activeSection === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveSection('calendar')}
          >
            📅 Calendar
          </button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <header>
          <h1>Department Head Dashboard</h1>
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
              <span>{user.name}</span>
              <div className="avatar">{user.name?.charAt(0)}</div>
            </button>
          </div>
        </header>

        <div className="content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">👥</div>
              <div className="stat-value">{employees.length}</div>
              <div className="stat-label">Total Employees</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow">📅</div>
              <div className="stat-value">{leaves.length}</div>
              <div className="stat-label">Leave Requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">💰</div>
              <div className="stat-value">{formatCurrency(totalSalary)}</div>
              <div className="stat-label">Total Payroll</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">📊</div>
              <div className="stat-value">{leaves.filter(l => l.status === 'pending').length}</div>
              <div className="stat-label">Pending Approvals</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="panel">
              <h3>Employee Overview</h3>
              <div className="employee-list">
                {employees.slice(0, 5).map(emp => (
                  <div key={emp.id} className="employee-item">
                    <div className="emp-avatar">{emp.name?.charAt(0)}</div>
                    <div className="emp-info">
                      <div className="emp-name">{emp.name}</div>
                      <div className="emp-email">{emp.email}</div>
                    </div>
                  </div>
                ))}
                {employees.length === 0 && (
                  <p className="no-data">No employees yet.</p>
                )}
              </div>
            </div>

            <div className="panel">
              <h3>Leave Status</h3>
              <div className="leave-stats">
                <div className="leave-stat">
                  <div className="leave-count">{leaves.filter(l => l.status === 'pending' && !l.chiefApproved).length}</div>
                  <div className="leave-label">Pending</div>
                </div>
                <div className="leave-stat">
                  <div className="leave-count approved">{leaves.filter(l => l.chiefApproved).length}</div>
                  <div className="leave-label">Chief Approved</div>
                </div>
                <div className="leave-stat">
                  <div className="leave-count rejected">{leaves.filter(l => l.status === 'rejected').length}</div>
                  <div className="leave-label">Rejected</div>
                </div>
              </div>
            </div>

            {/* Leave Requests for Chief Approval */}
            <div className="panel full-width">
              <h3>📋 Leave Requests Requiring Chief Approval</h3>
              {leaves.filter(l => l.status === 'pending' && !l.chiefApproved).length > 0 ? (
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.filter(l => l.status === 'pending' && !l.chiefApproved).map(leave => (
                      <tr key={leave.id}>
                        <td>{leave.employeeName}</td>
                        <td>{leave.leaveType}</td>
                        <td>{leave.startDate}</td>
                        <td>{leave.endDate}</td>
                        <td><strong>{leave.daysRequested}</strong></td>
                        <td>{leave.reason}</td>
                        <td>
                          <button 
                            className="btn btn-primary"
                            style={{ marginRight: '8px', padding: '6px 12px', background: '#059669' }}
                            onClick={() => confirmLeaveAction(leave.id, 'chief_approved')}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            className="btn btn-danger"
                            style={{ padding: '6px 12px' }}
                            onClick={() => confirmLeaveAction(leave.id, 'rejected')}
                          >
                            ✕ Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No pending leave requests requiring Chief approval.
                </div>
              )}
            </div>

            <div className="panel full-width">
              <h3>📅 Leave Calendar</h3>
              <Calendar leaves={leaves} />
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={modalContent.title}
        type={modalContent.type}
        confirmText={modalContent.confirmText || 'Confirm'}
        cancelText={modalContent.cancelText || 'Cancel'}
        showCancel={true}
        showConfirm={true}
        onConfirm={executeLeaveAction}
      >
        <p>{modalContent.message}</p>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent.title}
        type={modalContent.type}
      >
        <p>{modalContent.message}</p>
      </Modal>
    </div>
  );
};

export default HeadDashboard;
