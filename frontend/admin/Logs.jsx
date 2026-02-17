import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './Admin.css';

const Logs = () => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    const activitiesData = JSON.parse(localStorage.getItem('activities') || '[]');
    setActivities(activitiesData);
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all system logs?')) {
      localStorage.setItem('activities', JSON.stringify([]));
      setActivities([]);
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.status === filter);

  return (
    <AdminLayout>
      <div className="logs-page">
        <h2 className="page-title">System Logs</h2>
        
        {/* Stats */}
        <div className="dashboard-cards" style={{ marginBottom: '24px' }}>
          <div className="card">
            <div className="card-value">{activities.length}</div>
            <div className="card-subtitle">Total Activities</div>
          </div>
          <div className="card">
            <div className="card-value" style={{ color: '#059669' }}>
              {activities.filter(a => a.status === 'completed').length}
            </div>
            <div className="card-subtitle">Completed</div>
          </div>
          <div className="card">
            <div className="card-value" style={{ color: '#d97706' }}>
              {activities.filter(a => a.status === 'pending').length}
            </div>
            <div className="card-subtitle">Pending</div>
          </div>
        </div>

        {/* Filter and Actions */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button 
              className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
          </div>
          <button className="btn btn-danger" onClick={clearLogs}>
            🗑️ Clear Logs
          </button>
        </div>

        {/* Logs Table */}
        <div className="data-table">
          <div className="table-header">
            <h3 className="table-title">Activity Log</h3>
          </div>
          
          {filteredActivities.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity, index) => (
                  <tr key={index}>
                    <td>{activity.action}</td>
                    <td>{activity.user}</td>
                    <td>{activity.date}</td>
                    <td>
                      <span className={`status-badge ${activity.status}`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No activity logs yet. Activities will be recorded here as users interact with the system.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Logs;
