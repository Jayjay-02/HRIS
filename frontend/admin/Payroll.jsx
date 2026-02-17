import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import Modal from '../components/Modal';
import './Admin.css';

const PromoteEmployee = () => {
  const [users, setUsers] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newPosition, setNewPosition] = useState('');
  const [newRole, setNewRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [employeeAchievements, setEmployeeAchievements] = useState([]);
  const [employeeDocuments, setEmployeeDocuments] = useState([]);
  const [promotionHistory, setPromotionHistory] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadUsers();
    loadPromotionHistory();
  }, []);

  const loadUsers = () => {
    const usersData = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(usersData.filter(u => u.role !== 'admin'));
  };

  const loadPromotionHistory = () => {
    const history = JSON.parse(localStorage.getItem('promotionHistory') || '[]');
    setPromotionHistory(history);
  };

  const loadEmployeeData = (employee) => {
    // Load leaves for this employee
    const allLeaves = JSON.parse(localStorage.getItem('leaves') || '[]');
    const empLeaves = allLeaves.filter(l => 
      l.employeeId === employee.id || l.employeeName === employee.name
    );
    setEmployeeLeaves(empLeaves);

    // Load achievements for this employee
    const allAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    const empAchievements = allAchievements.filter(a => 
      a.employeeId === employee.id || a.employeeName === employee.name
    );
    setEmployeeAchievements(empAchievements);

    // Load documents for this employee
    const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const empDocuments = allDocuments.filter(d => 
      d.employeeId === employee.id || d.employeeName === employee.name
    );
    setEmployeeDocuments(empDocuments);
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    loadEmployeeData(employee);
    setShowDetailsModal(true);
  };

  const handlePromoteClick = (employee) => {
    setSelectedEmployee(employee);
    setNewPosition(employee.position || '');
    setNewRole(employee.role || 'employee');
    setShowPromoteModal(true);
  };

  const handlePromoteSubmit = () => {
    if (!newPosition.trim()) return;
    setShowConfirmModal(true);
  };

  const executePromotion = () => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.map(u => {
      if (u.id === selectedEmployee.id) {
        return { ...u, position: newPosition, role: newRole, promotedAt: new Date().toISOString() };
      }
      return u;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Save promotion history
    const history = JSON.parse(localStorage.getItem('promotionHistory') || '[]');
    const newPromotion = {
      id: Date.now(),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      oldPosition: selectedEmployee.position || 'N/A',
      newPosition: newPosition,
      oldRole: selectedEmployee.role,
      newRole: newRole,
      promotedAt: new Date().toISOString(),
      promotedBy: JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin'
    };
    localStorage.setItem('promotionHistory', JSON.stringify([newPromotion, ...history]));

    // Add notification
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift({
      id: Date.now(),
      type: 'promotion',
      title: 'Employee Promoted',
      message: `${selectedEmployee.name} has been promoted to ${newPosition}`,
      targetUserId: selectedEmployee.id,
      isRead: false,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString()
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Log activity
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    activities.unshift({
      action: `Promoted ${selectedEmployee.name} to ${newPosition}`,
      user: JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin',
      date: new Date().toLocaleDateString(),
      status: 'completed'
    });
    localStorage.setItem('activities', JSON.stringify(activities));

    // Reload
    loadUsers();
    loadPromotionHistory();
    setShowConfirmModal(false);
    setShowPromoteModal(false);
    setSelectedEmployee(null);
    setNewPosition('');
    setNewRole('');
  };

  const exportEmployeeReport = (employee) => {
    // Load all data for this employee
    const allLeaves = JSON.parse(localStorage.getItem('leaves') || '[]');
    const empLeaves = allLeaves.filter(l => l.employeeId === employee.id || l.employeeName === employee.name);
    
    const allAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    const empAchievements = allAchievements.filter(a => a.employeeId === employee.id || a.employeeName === employee.name);
    
    const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const empDocuments = allDocuments.filter(d => d.employeeId === employee.id || d.employeeName === employee.name);

    // Build Excel-compatible CSV with multiple sections
    let csvContent = '';
    
    // Employee Details Section
    csvContent += 'EMPLOYEE DETAILS\n';
    csvContent += 'Field,Value\n';
    csvContent += `Name,${employee.name}\n`;
    csvContent += `Email,${employee.email}\n`;
    csvContent += `Position,${employee.position || 'N/A'}\n`;
    csvContent += `Role,${employee.role}\n`;
    csvContent += `Phone,${employee.phone || 'N/A'}\n`;
    csvContent += `Address,"${(employee.address || 'N/A').replace(/"/g, '""')}"\n`;
    csvContent += `Date Registered,${employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'N/A'}\n`;
    csvContent += '\n';

    // Documents Section
    csvContent += 'DOCUMENTS POSTED\n';
    if (empDocuments.length > 0) {
      csvContent += 'Title,Type,Date Uploaded,Status\n';
      empDocuments.forEach(doc => {
        csvContent += `"${(doc.title || '').replace(/"/g, '""')}","${doc.type || ''}",${doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'},${doc.status || 'N/A'}\n`;
      });
    } else {
      csvContent += 'No documents found\n';
    }
    csvContent += '\n';

    // Leave Records Section
    csvContent += 'LEAVE RECORDS\n';
    if (empLeaves.length > 0) {
      csvContent += 'Leave Type,Start Date,End Date,Days,Reason,Status\n';
      empLeaves.forEach(leave => {
        csvContent += `${leave.leaveType || ''},${leave.startDate || ''},${leave.endDate || ''},${leave.daysRequested || ''},"${(leave.reason || '').replace(/"/g, '""')}",${leave.status || ''}\n`;
      });
    } else {
      csvContent += 'No leave records found\n';
    }
    csvContent += '\n';

    // Achievements Section
    csvContent += 'ACHIEVEMENTS\n';
    if (empAchievements.length > 0) {
      csvContent += 'Title,Description,Date,Status\n';
      empAchievements.forEach(ach => {
        csvContent += `"${(ach.title || '').replace(/"/g, '""')}","${(ach.description || '').replace(/"/g, '""')}",${ach.date || ''},${ach.status || ''}\n`;
      });
    } else {
      csvContent += 'No achievements found\n';
    }

    // Download as .xls (Excel-compatible CSV)
    const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${employee.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const positions = [
    'Administrative Aide I',
    'Administrative Aide II',
    'Administrative Aide III',
    'Administrative Aide IV',
    'Administrative Aide V',
    'Administrative Aide VI',
    'Administrative Officer I',
    'Administrative Officer II',
    'Administrative Officer III',
    'Administrative Officer IV',
    'Administrative Officer V',
    'Transportation Development Officer I',
    'Transportation Development Officer II',
    'Transportation Development Officer III',
    'Senior Transportation Development Officer',
    'Supervising Transportation Development Officer',
    'Chief Transportation Development Officer',
    'Motor Vehicle Registration Examiner I',
    'Motor Vehicle Registration Examiner II',
    'Motor Vehicle Registration Examiner III',
    'License Examiner I',
    'License Examiner II',
    'License Examiner III',
    'Head Executive Assistant',
    'Division Chief',
    'Regional Director',
    'Assistant Regional Director'
  ];

  return (
    <AdminLayout>
      <div className="payroll-page">
        <h2 className="page-title">🏅 Promote Employee</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Only administrators can promote employees. Select an employee to view details or promote.
        </p>
        
        {/* Stats */}
        <div className="dashboard-cards" style={{ marginBottom: '24px' }}>
          <div className="card">
            <div className="card-value">{users.length}</div>
            <div className="card-subtitle">Registered Employees</div>
          </div>
          <div className="card">
            <div className="card-value">{promotionHistory.length}</div>
            <div className="card-subtitle">Total Promotions</div>
          </div>
          <div className="card">
            <div className="card-value">
              {promotionHistory.filter(p => {
                const d = new Date(p.promotedAt);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div className="card-subtitle">This Month</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="🔍 Search employee by name, email, or position..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Employee List */}
        <div className="data-table">
          <div className="table-header">
            <h3 className="table-title">Employee List</h3>
          </div>
          
          {filteredUsers.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Current Position</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#1a365d',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          {user.name ? user.name.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <span style={{ fontWeight: '500' }}>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.position || <span style={{ color: '#9ca3af' }}>Not assigned</span>}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => handleViewDetails(user)}
                        >
                          👁️ View Details
                        </button>
                        <button 
                          className="btn btn-primary" 
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => handlePromoteClick(user)}
                        >
                          ⬆️ Promote
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ fontSize: '12px', padding: '6px 12px', background: '#059669', color: '#fff', border: 'none' }}
                          onClick={() => exportEmployeeReport(user)}
                          title="Download employee report as Excel"
                        >
                          📥 Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {searchTerm ? 'No employees match your search.' : 'No registered employees found.'}
            </div>
          )}
        </div>

        {/* Promotion History */}
        {promotionHistory.length > 0 && (
          <div className="data-table" style={{ marginTop: '24px' }}>
            <div className="table-header">
              <h3 className="table-title">Promotion History</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Previous Position</th>
                  <th>New Position</th>
                  <th>Promoted By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {promotionHistory.slice(0, 10).map((promo) => (
                  <tr key={promo.id}>
                    <td>{promo.employeeName}</td>
                    <td>{promo.oldPosition}</td>
                    <td style={{ fontWeight: '600', color: '#059669' }}>{promo.newPosition}</td>
                    <td>{promo.promotedBy}</td>
                    <td>{new Date(promo.promotedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Employee Details Modal */}
        {showDetailsModal && selectedEmployee && (
          <div className="form-modal" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '85vh', overflow: 'auto' }}>
              <div className="modal-header">
                <h3 className="modal-title">Employee Details - {selectedEmployee.name}</h3>
                <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {/* Employee Info */}
                <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '12px', color: '#1a365d' }}>📋 Personal Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div><strong>Name:</strong> {selectedEmployee.name}</div>
                    <div><strong>Email:</strong> {selectedEmployee.email}</div>
                    <div><strong>Position:</strong> {selectedEmployee.position || 'Not assigned'}</div>
                    <div><strong>Role:</strong> {selectedEmployee.role}</div>
                    <div><strong>Phone:</strong> {selectedEmployee.phone || 'N/A'}</div>
                    <div><strong>Address:</strong> {selectedEmployee.address || 'N/A'}</div>
                    <div><strong>Registered:</strong> {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>

                {/* Documents */}
                <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '12px', color: '#166534' }}>📄 Documents Posted ({employeeDocuments.length})</h4>
                  {employeeDocuments.length > 0 ? (
                    <table style={{ width: '100%', fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Title</th>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Type</th>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Date</th>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeDocuments.map((doc, i) => (
                          <tr key={i}>
                            <td style={{ padding: '6px' }}>{doc.title}</td>
                            <td style={{ padding: '6px' }}>{doc.type}</td>
                            <td style={{ padding: '6px' }}>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</td>
                            <td style={{ padding: '6px' }}>{doc.status || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>No documents posted yet.</p>
                  )}
                </div>

                {/* Leave Records */}
                <div style={{ marginBottom: '20px', padding: '16px', background: '#fffbeb', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '12px', color: '#92400e' }}>📅 Leave Records ({employeeLeaves.length})</h4>
                  {employeeLeaves.length > 0 ? (
                    <table style={{ width: '100%', fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Type</th>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Start</th>
                          <th style={{ textAlign: 'left', padding: '6px' }}>End</th>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Days</th>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeLeaves.map((leave, i) => (
                          <tr key={i}>
                            <td style={{ padding: '6px' }}>{leave.leaveType}</td>
                            <td style={{ padding: '6px' }}>{leave.startDate}</td>
                            <td style={{ padding: '6px' }}>{leave.endDate}</td>
                            <td style={{ padding: '6px' }}>{leave.daysRequested}</td>
                            <td style={{ padding: '6px' }}>
                              <span className={`status-badge ${leave.status}`}>{leave.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>No leave records found.</p>
                  )}
                </div>

                {/* Achievements */}
                <div style={{ marginBottom: '20px', padding: '16px', background: '#faf5ff', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '12px', color: '#6b21a8' }}>🏆 Achievements ({employeeAchievements.length})</h4>
                  {employeeAchievements.length > 0 ? (
                    <table style={{ width: '100%', fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Title</th>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Description</th>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Date</th>
                          <th style={{ textAlign: 'left', padding: '6px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeAchievements.map((ach, i) => (
                          <tr key={i}>
                            <td style={{ padding: '6px' }}>{ach.title}</td>
                            <td style={{ padding: '6px' }}>{ach.description?.substring(0, 40)}...</td>
                            <td style={{ padding: '6px' }}>{ach.date}</td>
                            <td style={{ padding: '6px' }}>
                              <span className={`status-badge ${ach.status}`}>{ach.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>No achievements found.</p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-primary" 
                  style={{ background: '#059669' }}
                  onClick={() => exportEmployeeReport(selectedEmployee)}
                >
                  📥 Download Report (Excel)
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handlePromoteClick(selectedEmployee);
                  }}
                >
                  ⬆️ Promote Employee
                </button>
                <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Promote Employee Modal */}
        {showPromoteModal && selectedEmployee && (
          <div className="form-modal" onClick={() => setShowPromoteModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Promote Employee</h3>
                <button className="modal-close" onClick={() => setShowPromoteModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <strong>Employee:</strong> {selectedEmployee.name}<br />
                  <strong>Current Position:</strong> {selectedEmployee.position || 'Not assigned'}<br />
                  <strong>Current Role:</strong> {selectedEmployee.role}
                </div>
                <div className="form-group">
                  <label>New Position</label>
                  <select
                    value={newPosition}
                    onChange={e => setNewPosition(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  >
                    <option value="">Select new position</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#6b7280' }}>Or type a custom position:</label>
                    <input
                      type="text"
                      value={newPosition}
                      onChange={e => setNewPosition(e.target.value)}
                      placeholder="Enter custom position"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginTop: '4px' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>New Role</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  >
                    <option value="employee">Employee</option>
                    <option value="head">Head</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPromoteModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handlePromoteSubmit}
                  disabled={!newPosition.trim()}
                >
                  ⬆️ Promote
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Promotion Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Promotion"
          type="confirm"
          confirmText="Yes, Promote"
          cancelText="Cancel"
          showCancel={true}
          showConfirm={true}
          onConfirm={executePromotion}
        >
          <p>Are you sure you want to promote <strong>{selectedEmployee?.name}</strong> to <strong>{newPosition}</strong>?</p>
          {selectedEmployee?.position && (
            <p style={{ color: '#6b7280', fontSize: '13px' }}>
              Previous position: {selectedEmployee.position}
            </p>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default PromoteEmployee;
