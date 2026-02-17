import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import Modal from '../components/Modal';
import './Admin.css';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });
  const [pendingAction, setPendingAction] = useState({ id: null, status: null, leave: null });

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = () => {
    const leavesData = JSON.parse(localStorage.getItem('leaves') || '[]');
    setLeaves(leavesData);
  };

  // Show confirmation modal before approving/declining
  const confirmStatusChange = (id, status) => {
    const leave = leaves.find(l => l.id === id);
    setPendingAction({ id, status, leave });
    
    if (status === 'approved') {
      // Check if already approved by chief
      if (leave.chiefApproved) {
        setModalContent({
          title: 'Approve Leave Request',
          message: `Are you sure you want to give FINAL APPROVAL to this leave request for ${leave?.employeeName}? This will notify the employee that their leave has been approved.`,
          type: 'confirm',
          confirmText: 'Yes, Approve',
          cancelText: 'Cancel'
        });
      } else {
        setModalContent({
          title: 'Forward to Chief',
          message: `This leave needs to be approved by the Chief first. Would you like to forward it to the Chief for approval?`,
          type: 'confirm',
          confirmText: 'Yes, Forward',
          cancelText: 'Cancel'
        });
      }
    } else {
      setModalContent({
        title: 'Decline Leave Request',
        message: `Are you sure you want to DECLINE this leave request for ${leave?.employeeName}?`,
        type: 'danger',
        confirmText: 'Yes, Decline',
        cancelText: 'Cancel'
      });
    }
    setShowConfirmModal(true);
  };

  // Execute the action after confirmation
  const executeStatusChange = () => {
    const { id, status, leave } = pendingAction;
    
    // Update leave status
    const updatedLeaves = leaves.map(l => 
      l.id === id ? { ...l, status, chiefApproved: status === 'approved' ? true : l.chiefApproved } : l
    );
    localStorage.setItem('leaves', JSON.stringify(updatedLeaves));
    setLeaves(updatedLeaves);
    
    // Determine notification message based on approval stage
    let notificationMessage = '';
    let notificationTitle = '';
    
    if (status === 'approved') {
      if (leave.chiefApproved) {
        // Final approval by admin - notify employee
        notificationTitle = 'Leave Fully Approved';
        notificationMessage = `Your leave request for ${leave?.daysRequested} days has been APPROVED by the Chief and Admin. ${leave?.daysRequested} days have been deducted from your leave balance.`;
        
        // Create notification for the employee
        const notification = {
          id: Date.now(),
          type: 'leave_response',
          title: notificationTitle,
          message: notificationMessage,
          date: new Date().toISOString(),
          userId: leave?.employeeId,
          isRead: false
        };
        
        const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        localStorage.setItem('notifications', JSON.stringify([notification, ...allNotifications]));
        
        // Log activity
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        const newActivity = {
          action: `Fully approved leave request for ${leave?.daysRequested} days (Chief and Admin)`,
          user: leave?.employeeName || 'Unknown',
          date: new Date().toLocaleDateString(),
          status: 'completed'
        };
        localStorage.setItem('activities', JSON.stringify([newActivity, ...activities]));
        
        // Show success message
        setModalContent({
          title: 'Leave Fully Approved',
          message: `${leave?.daysRequested} days have been deducted from ${leave?.employeeName}'s leave balance. The employee has been notified.`,
          type: 'success'
        });
        setShowModal(true);
      } else {
        // Forward to chief for approval
        notificationTitle = 'Pending Chief Approval';
        notificationMessage = `Your leave request has been forwarded to the Chief for approval.`;
        
        // Create notification for the chief
        const chiefs = JSON.parse(localStorage.getItem('users') || '[]').filter(u => u.role === 'head');
        const chiefNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        chiefs.forEach(chief => {
          chiefNotifications.push({
            id: Date.now() + chief.id,
            type: 'leave',
            title: 'Leave Pending Chief Approval',
            message: `${leave?.employeeName} has submitted a leave request for ${leave?.daysRequested} days. Please review.`,
            userId: chief.id,
            targetUserId: leave?.employeeId,
            leaveId: leave?.id,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        });
        localStorage.setItem('notifications', JSON.stringify(chiefNotifications));
        
        // Log activity
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        const newActivity = {
          action: `Forwarded leave request for ${leave?.daysRequested} days to Chief`,
          user: leave?.employeeName || 'Unknown',
          date: new Date().toLocaleDateString(),
          status: 'pending'
        };
        localStorage.setItem('activities', JSON.stringify([newActivity, ...activities]));
        
        // Show success message
        setModalContent({
          title: 'Forwarded to Chief',
          message: `Leave request for ${leave?.employeeName} has been forwarded to the Chief for approval.`,
          type: 'success'
        });
        setShowModal(true);
      }
    } else {
      // Rejected
      notificationTitle = 'Leave Request Declined';
      notificationMessage = `Your leave request for ${leave?.daysRequested} days has been declined.`;
      
      // Create notification for the employee
      const notification = {
        id: Date.now(),
        type: 'leave_response',
        title: notificationTitle,
        message: notificationMessage,
        date: new Date().toISOString(),
        userId: leave?.employeeId,
        isRead: false
      };
      
      const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      localStorage.setItem('notifications', JSON.stringify([notification, ...allNotifications]));
      
      // Log activity
      const activities = JSON.parse(localStorage.getItem('activities') || '[]');
      const newActivity = {
        action: `Declined leave request for ${leave?.daysRequested} days`,
        user: leave?.employeeName || 'Unknown',
        date: new Date().toLocaleDateString(),
        status: 'completed'
      };
      localStorage.setItem('activities', JSON.stringify([newActivity, ...activities]));
      
      // Show success message
      setModalContent({
        title: 'Leave Declined',
        message: `Leave request for ${leave?.employeeName} has been declined.`,
        type: 'success'
      });
      setShowModal(true);
    }
    
    setShowConfirmModal(false);
  };

  const filteredLeaves = filter === 'all' 
    ? leaves 
    : filter === 'chief_approved'
    ? leaves.filter(leave => leave.status === 'pending' && leave.chiefApproved)
    : filter === 'needs_chief'
    ? leaves.filter(leave => leave.status === 'pending' && !leave.chiefApproved)
    : leaves.filter(leave => leave.status === filter);

  return (
    <AdminLayout>
      <div className="leaves-page">
        <h2 className="page-title">Leave Requests Management</h2>
        
        {/* Stats */}
        <div className="dashboard-cards" style={{ marginBottom: '24px' }}>
          <div className="card">
            <div className="card-value">{leaves.length}</div>
            <div className="card-subtitle">Total Requests</div>
          </div>
          <div className="card">
            <div className="card-value" style={{ color: '#d97706' }}>
              {leaves.filter(l => l.status === 'pending' && !l.chiefApproved).length}
            </div>
            <div className="card-subtitle">Pending (Needs Chief)</div>
          </div>
          <div className="card">
            <div className="card-value" style={{ color: '#7c3aed' }}>
              {leaves.filter(l => l.status === 'pending' && l.chiefApproved).length}
            </div>
            <div className="card-subtitle">Pending (Needs Admin)</div>
          </div>
          <div className="card">
            <div className="card-value" style={{ color: '#059669' }}>
              {leaves.filter(l => l.status === 'approved').length}
            </div>
            <div className="card-subtitle">Fully Approved</div>
          </div>
          <div className="card">
            <div className="card-value" style={{ color: '#dc2626' }}>
              {leaves.filter(l => l.status === 'rejected').length}
            </div>
            <div className="card-subtitle">Rejected</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ marginBottom: '20px' }}>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
            style={{ marginRight: '8px' }}
          >
            All
          </button>
          <button
            className={`btn ${filter === 'needs_chief' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('needs_chief')}
            style={{ marginRight: '8px' }}
          >
            Needs Chief
          </button>
          <button
            className={`btn ${filter === 'chief_approved' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('chief_approved')}
            style={{ marginRight: '8px' }}
          >
            Needs Admin
          </button>
          <button
            className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('approved')}
            style={{ marginRight: '8px' }}
          >
            Approved
          </button>
          <button
            className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>

        {/* Leaves Table */}
        <div className="data-table">
          {filteredLeaves.length > 0 ? (
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map(leave => (
                  <tr key={leave.id}>
                    <td>{leave.employeeName}</td>
                    <td>{leave.leaveType}</td>
                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>
                    <td><strong>{leave.daysRequested}</strong></td>
                    <td>{leave.reason}</td>
                    <td>
                      {leave.chiefApproved ? (
                        <span className="status-badge approved">Chief Approved</span>
                      ) : (
                        <span className={`status-badge ${leave.status}`}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      )}
                    </td>
                    <td>
                      {leave.status === 'pending' && !leave.chiefApproved && (
                        <button 
                          className="btn btn-primary"
                          style={{ marginRight: '8px', padding: '6px 12px', background: '#059669' }}
                          onClick={() => confirmStatusChange(leave.id, 'approved')}
                        >
                          ✓ Forward to Chief
                        </button>
                      )}
                      {leave.status === 'pending' && leave.chiefApproved && (
                        <button 
                          className="btn btn-primary"
                          style={{ marginRight: '8px', padding: '6px 12px', background: '#059669' }}
                          onClick={() => confirmStatusChange(leave.id, 'approved')}
                        >
                          ✓ Final Approve
                        </button>
                      )}
                      {leave.status === 'pending' && (
                        <button 
                          className="btn btn-danger"
                          style={{ padding: '6px 12px' }}
                          onClick={() => confirmStatusChange(leave.id, 'rejected')}
                        >
                          ✕ Reject
                        </button>
                      )}
                      {leave.status !== 'pending' && (
                        <span style={{ color: '#6b7280' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {leaves.length === 0 
                ? 'No leave requests yet. Employees will submit requests here.'
                : `No ${filter} leave requests.`
              }
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)} 
        title={modalContent.title}
        type={modalContent.type === 'confirm' ? 'warning' : modalContent.type}
        confirmText={modalContent.confirmText || 'Confirm'}
        cancelText={modalContent.cancelText || 'Cancel'}
        showCancel={true}
        showConfirm={true}
        onConfirm={executeStatusChange}
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
    </AdminLayout>
  );
};

export default Leaves;
