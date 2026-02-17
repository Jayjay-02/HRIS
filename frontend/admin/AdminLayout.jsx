import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Admin.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const loadNotifications = () => {
      const allNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
      const userRole = currentUser?.role || '';
      
      // Filter notifications based on role
      const filteredNotifs = allNotifs.filter(notif => {
        // Admin sees all notifications
        if (userRole === 'admin') return true;
        // Head sees only leave notifications
        if (userRole === 'head') return notif.type === 'leave';
        // Employee sees only their own notifications
        if (userRole === 'employee') return notif.targetUserId === currentUser?.id;
        return true;
      });
      
      setNotifications(filteredNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.role, currentUser?.id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const markAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
    setShowNotifDropdown(false);
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

  return (
    <div className="admin-layout">
      <aside className={`Sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src="/assets/lto.png" alt="LTO Logo" />
            <span className="logo-text">LTO IHREMS</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item active">
            <span className="icon">🏠</span>
            <span className="text">HR Dashboard</span>
          </Link>
          <Link to="/admin/reports" className="nav-item">
            <span className="icon">📊</span>
            <span className="text">Reports</span>
          </Link>
          <Link to="/admin/users" className="nav-item">
            <span className="icon">👤</span>
            <span className="text">Employee Management</span>
          </Link>
          <Link to="/admin/leaves" className="nav-item">
            <span className="icon">📅</span>
            <span className="text">Leave Management</span>
          </Link>
          <Link to="/admin/achievements" className="nav-item">
            <span className="icon">🏆</span>
            <span className="text">Achievements</span>
          </Link>
          <Link to="/admin/payroll" className="nav-item">
            <span className="icon">🏅</span>
            <span className="text">Promote Employee</span>
          </Link>
          <Link to="/admin/settings" className="nav-item">
            <span className="icon">⚙️</span>
            <span className="text">Settings</span>
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="icon">🚪</span>
            <span className="text">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <div className="lto-brand">
              <img src="/assets/lto.png" alt="LTO" className="header-logo" />
              <span className="brand-name">LTO IHREMS</span>
            </div>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <button 
                className="notification-bell"
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown) markAsRead();
                }}
              >
                🔔
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              {showNotifDropdown && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications} className="clear-btn">Clear All</button>
                    )}
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
            <div className="user-info" onClick={() => setShowProfileDropdown(!showProfileDropdown)} style={{ cursor: 'pointer' }}>
              <span className="user-name">{currentUser.name || 'Administrator'}</span>
              <span className="user-role">HR</span>
            </div>
            <div className="user-avatar" onClick={() => setShowProfileDropdown(!showProfileDropdown)} style={{ cursor: 'pointer' }}>
              {currentUser?.profilePicture ? (
                <img src={currentUser.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'
              )}
            </div>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <Link to="/admin/profile" className="profile-menu-item">
                  <span>👤</span> My Profile
                </Link>
                <Link to="/admin/settings" className="profile-menu-item">
                  <span>⚙️</span> Settings
                </Link>
                <button onClick={handleLogout} className="profile-menu-item logout">
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
