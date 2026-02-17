import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import Modal from '../components/Modal';
import './Admin.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [employeeDocuments, setEmployeeDocuments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info', action: null });
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    position: '',
    department: ''
  });

  // List of departments
  const departments = [
    'Administrative',
    'Finance',
    'Operations',
    'IT',
    'Human Resources',
    'Legal',
    'Records',
    'Motor Vehicle Inspection',
    'Drivers License',
    'Planning'
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const usersData = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(usersData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Check if position is being changed (promotion)
      const oldPosition = editingUser.position || '';
      const newPosition = formData.position || '';
      
      if (oldPosition !== newPosition && newPosition) {
        // Show promotion confirmation
        setModalContent({
          title: 'Confirm Promotion',
          message: `Are you sure you want to promote ${formData.name} to "${newPosition}"?`,
          type: 'confirm',
          confirmText: 'Yes, Promote',
          cancelText: 'Cancel',
          action: 'promote'
        });
        setShowConfirmModal(true);
        return;
      }
      
      // Update existing user
      const updatedUsers = users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData, password: formData.password || u.password }
          : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      logActivity('Updated user', formData.name);
    } else {
      // Create new user
      const newUser = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      logActivity('Created new user', formData.name);
    }
    
    loadUsers();
    closeModal();
  };

  const handleDelete = (id) => {
    const user = users.find(u => u.id === id);
    setDeleteUserId(id);
    setModalContent({
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      action: 'delete'
    });
    setShowConfirmModal(true);
  };

  const executeAction = () => {
    if (modalContent.action === 'delete') {
      const updatedUsers = users.filter(u => u.id !== deleteUserId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      loadUsers();
    } else if (modalContent.action === 'promote') {
      // Actually perform the promotion update
      const updatedUsers = users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData, password: formData.password || u.password }
          : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      logActivity('Promoted user', formData.name);
      loadUsers();
      closeModal();
    }
    setShowConfirmModal(false);
  };

  const viewEmployeeDocuments = (user) => {
    const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const userDocs = allDocuments.filter(d => d.employeeId === user.id);
    setSelectedEmployee(user);
    setEmployeeDocuments(userDocs);
    setShowDocumentsModal(true);
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        position: user.position || '',
        department: user.department || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        position: '',
        department: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      position: '',
      department: ''
    });
  };

  const logActivity = (action, userName) => {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const newActivity = {
      action,
      user: userName,
      date: new Date().toLocaleDateString(),
      status: 'completed'
    };
    localStorage.setItem('activities', JSON.stringify([newActivity, ...activities]));
  };

  return (
    <AdminLayout>
      <div className="users-page">
        <h2 className="page-title">User Management</h2>
        
        <div className="data-table">
          <div className="table-header">
            <h3 className="table-title">All Users</h3>
            <div className="table-actions">
              <button className="btn btn-primary" onClick={() => openModal()}>
                ➕ Add User
              </button>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Position</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.position || '-'}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ marginRight: '8px', padding: '6px 12px' }}
                        onClick={() => viewEmployeeDocuments(user)}
                      >
                        📄 Documents
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ marginRight: '8px', padding: '6px 12px' }}
                        onClick={() => openModal(user)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleDelete(user.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    No users found. Click "Add User" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit User Modal */}
        {showModal && (
          <div className="form-modal" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>
              <form id="user-form" onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Password {editingUser && <span style={{ color: '#6b7280', fontWeight: 'normal' }}>(leave blank to keep current)</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder={editingUser ? "Enter new password" : "Enter password"}
                      required={!editingUser}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="admin">Admin</option>
                      <option value="hr">HR</option>
                      <option value="head">Chief</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Position / Job Title</label>
                    <input
                      type="text"
                      value={formData.position || ''}
                      onChange={e => setFormData({...formData, position: e.target.value})}
                      placeholder="e.g., Senior Officer, Manager, Clerk"
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      value={formData.department || ''}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

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
        onConfirm={executeAction}
      >
        <p>{modalContent.message}</p>
      </Modal>

      {/* Employee Documents Modal */}
      {showDocumentsModal && (
        <div className="modal-overlay" onClick={() => setShowDocumentsModal(false)}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <span className="modal-icon info">📄</span>
                <h3>{selectedEmployee?.name}'s Documents</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDocumentsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {employeeDocuments.length > 0 ? (
                <div className="documents-list">
                  {employeeDocuments.map(doc => (
                    <div key={doc.id} style={{ 
                      padding: '15px', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px', 
                      marginBottom: '10px',
                      background: '#f9fafb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#1a365d' }}>
                            {doc.documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                            {doc.description || 'No description'}
                          </p>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <a 
                          href={doc.fileData} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ padding: '8px 16px' }}
                        >
                          View PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                  No documents uploaded yet.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowDocumentsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Users;
