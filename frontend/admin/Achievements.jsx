import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import Modal from '../components/Modal';
import './Admin.css';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' });
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = () => {
    const data = JSON.parse(localStorage.getItem('achievements') || '[]');
    setAchievements(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const handleApprove = (achievement) => {
    setSelectedAchievement(achievement);
    setModalContent({
      title: 'Approve Achievement',
      message: `Are you sure you want to approve this achievement from ${achievement.employeeName}?`,
      type: 'warning',
      onConfirm: () => {
        const allAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const updated = allAchievements.map(a => 
          a.id === achievement.id ? { ...a, status: 'approved' } : a
        );
        localStorage.setItem('achievements', JSON.stringify(updated));
        
        // Create notification for the employee
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.push({
          id: Date.now(),
          type: 'achievement',
          targetUserId: achievement.employeeId,
          message: `Your achievement "${achievement.title}" has been approved!`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        loadAchievements();
        setShowModal(false);
      }
    });
    setShowModal(true);
  };

  const handleReject = (achievement) => {
    setSelectedAchievement(achievement);
    setModalContent({
      title: 'Reject Achievement',
      message: `Are you sure you want to reject this achievement from ${achievement.employeeName}?`,
      type: 'warning',
      onConfirm: () => {
        const allAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const updated = allAchievements.map(a => 
          a.id === achievement.id ? { ...a, status: 'rejected' } : a
        );
        localStorage.setItem('achievements', JSON.stringify(updated));
        
        // Create notification for the employee
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.push({
          id: Date.now(),
          type: 'achievement',
          targetUserId: achievement.employeeId,
          message: `Your achievement "${achievement.title}" has been rejected.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        loadAchievements();
        setShowModal(false);
      }
    });
    setShowModal(true);
  };

  const pendingAchievements = achievements.filter(a => a.status === 'pending');
  const approvedAchievements = achievements.filter(a => a.status === 'approved');
  const rejectedAchievements = achievements.filter(a => a.status === 'rejected');

  return (
    <AdminLayout>
      <div className="leaves-page">
        <h2 className="page-title">Achievement Management</h2>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon yellow">🏆</div>
            <div className="stat-info">
              <h3>{pendingAchievements.length}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{approvedAchievements.length}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">❌</div>
            <div className="stat-info">
              <h3>{rejectedAchievements.length}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>

        {/* Pending Achievements */}
        <div className="data-table">
          <div className="table-header">
            <h3 className="table-title">Pending Achievements</h3>
          </div>
          {pendingAchievements.length > 0 ? (
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAchievements.map(achievement => (
                  <tr key={achievement.id}>
                    <td>{achievement.employeeName}</td>
                    <td>{achievement.title}</td>
                    <td>{achievement.description?.substring(0, 50)}...</td>
                    <td>{new Date(achievement.date).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleApprove(achievement)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn btn-danger" 
                          onClick={() => handleReject(achievement)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No pending achievements to review
            </div>
          )}
        </div>

        {/* All Achievements */}
        <div className="data-table" style={{ marginTop: '24px' }}>
          <div className="table-header">
            <h3 className="table-title">All Achievements</h3>
          </div>
          {achievements.length > 0 ? (
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {achievements.map(achievement => (
                  <tr key={achievement.id}>
                    <td>{achievement.employeeName}</td>
                    <td>{achievement.title}</td>
                    <td>{achievement.description?.substring(0, 50)}...</td>
                    <td>{new Date(achievement.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${achievement.status}`}>
                        {achievement.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No achievements submitted yet
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalContent.title}
          message={modalContent.message}
          type={modalContent.type}
          confirmText={modalContent.type === 'warning' ? 'Confirm' : 'OK'}
          cancelText="Cancel"
          showCancel={modalContent.type === 'warning'}
          showConfirm={true}
          onConfirm={modalContent.onConfirm}
        >
          <p>{modalContent.message}</p>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default Achievements;
