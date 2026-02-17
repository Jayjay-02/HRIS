import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });
  const [leaveBalance, setLeaveBalance] = useState(15);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePicture: ''
  });
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    date: ''
  });
  const [documents, setDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    documentType: 'birth_certificate',
    description: ''
  });
  const [showLeaveFormModal, setShowLeaveFormModal] = useState(false);
  const [selectedLeaveForPrint, setSelectedLeaveForPrint] = useState(null);

  // Leave form template state
  const [leaveFormTemplate, setLeaveFormTemplate] = useState({
    position: '',
    department: '',
    salary: '',
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
    commutation: 'none',
    contactAddress: '',
    filedDate: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'employee') {
      navigate('/login');
      return;
    }
    setUser(userData);
    loadData(userData);
  }, [navigate]);

  const loadData = (userData) => {
    setProfileForm({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || '',
      profilePicture: userData.profilePicture || ''
    });
    
    const allLeaves = JSON.parse(localStorage.getItem('leaves') || '[]');
    const userLeaves = allLeaves.filter(l => l.employeeId === userData.id);
    setLeaves(userLeaves);
    
    const approvedLeaves = userLeaves.filter(l => l.status === 'approved');
    const usedDays = approvedLeaves.reduce((total, leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
    setLeaveBalance(15 - usedDays);
    
    const allAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    // Show only approved achievements for employees
    const userAchievements = allAchievements.filter(a => a.employeeId === userData.id && a.status === 'approved');
    setAchievements(userAchievements);
    
    const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(notifs.filter(n => n.targetUserId === userData.id));
    
    const allPayrolls = JSON.parse(localStorage.getItem('payroll') || '[]');
    setPayrolls(allPayrolls.filter(p => p.employeeName === userData.name));
    
    // Load employee documents
    const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    setDocuments(allDocuments.filter(d => d.employeeId === userData.id));
    
    // Initialize leave form template with user data
    setLeaveFormTemplate({
      position: userData.position || '',
      department: userData.department || '',
      salary: userData.salary || '',
      leaveType: 'vacation',
      startDate: '',
      endDate: '',
      reason: '',
      commutation: 'none',
      contactAddress: userData.address || '',
      filedDate: new Date().toISOString().split('T')[0]
    });
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
    setModalContent({
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully!',
      type: 'success'
    });
    setShowModal(true);
  };

  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    
    const daysRequested = calculateLeaveDays(leaveForm.startDate, leaveForm.endDate);
    
    if (daysRequested > leaveBalance) {
      setModalContent({
        title: 'Insufficient Leave Balance',
        message: `You only have ${leaveBalance} days available. Please adjust your leave dates.`,
        type: 'warning'
      });
      setShowModal(true);
      return;
    }
    
    const newLeave = {
      id: Date.now(),
      employeeId: user.id,
      employeeName: user.name,
      ...leaveForm,
      daysRequested,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const allLeaves = JSON.parse(localStorage.getItem('leaves') || '[]');
    const updatedLeaves = [...allLeaves, newLeave];
    localStorage.setItem('leaves', JSON.stringify(updatedLeaves));
    setLeaves([...leaves, newLeave]);
    
    const notification = {
      id: Date.now(),
      type: 'leave',
      targetUserId: user.id,
      title: 'New Leave Request',
      message: `${user.name} has filed a ${leaveForm.leaveType} leave for ${daysRequested} days`,
      date: new Date().toISOString(),
      forRoles: ['admin', 'hr'],
      isRead: false
    };
    
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    localStorage.setItem('notifications', JSON.stringify([notification, ...allNotifications]));
    
    setShowLeaveModal(false);
    setModalContent({
      title: 'Leave Request Submitted',
      message: 'Your leave request has been submitted successfully! Notification sent to Admin and HR.',
      type: 'success'
    });
    setShowModal(true);
    setLeaveForm({ leaveType: 'vacation', startDate: '', endDate: '', reason: '' });
  };

  const handleAchievementSubmit = (e) => {
    e.preventDefault();
    
    const newAchievement = {
      id: Date.now(),
      employeeId: user.id,
      employeeName: user.name,
      ...achievementForm,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const allAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    const updatedAchievements = [...allAchievements, newAchievement];
    localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
    setAchievements([...achievements, newAchievement]);
    
    const notification = {
      id: Date.now(),
      type: 'achievement',
      targetUserId: user.id,
      title: 'New Achievement Submitted',
      message: `${user.name} submitted an achievement: ${achievementForm.title}`,
      date: new Date().toISOString(),
      forRoles: ['admin'],
      isRead: false
    };
    
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    localStorage.setItem('notifications', JSON.stringify([notification, ...allNotifications]));
    
    setShowAchievementModal(false);
    setModalContent({
      title: 'Achievement Submitted',
      message: 'Your achievement has been submitted successfully!',
      type: 'success'
    });
    setShowModal(true);
    setAchievementForm({ title: '', description: '', date: '' });
  };

  const handleDocumentUpload = (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('document-file');
    const file = fileInput?.files[0];
    
    if (!file) {
      setModalContent({
        title: 'Error',
        message: 'Please select a file to upload.',
        type: 'error'
      });
      setShowModal(true);
      return;
    }
    
    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      setModalContent({
        title: 'Error',
        message: 'Only PDF files are allowed.',
        type: 'error'
      });
      setShowModal(true);
      return;
    }
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const newDocument = {
        id: Date.now(),
        employeeId: user.id,
        employeeName: user.name,
        documentType: documentForm.documentType,
        description: documentForm.description,
        fileName: file.name,
        fileData: reader.result, // Base64 encoded PDF
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      };
      
      const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
      const updatedDocuments = [...allDocuments, newDocument];
      localStorage.setItem('documents', JSON.stringify(updatedDocuments));
      setDocuments([...documents, newDocument]);
      
      setShowDocumentModal(false);
      setModalContent({
        title: 'Document Uploaded',
        message: 'Your document has been uploaded successfully!',
        type: 'success'
      });
      setShowModal(true);
      setDocumentForm({ documentType: 'birth_certificate', description: '' });
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleLeaveFormTemplateSubmit = (e) => {
    e.preventDefault();
    
    const daysRequested = calculateLeaveDays(leaveFormTemplate.startDate, leaveFormTemplate.endDate);
    
    if (daysRequested > leaveBalance) {
      setModalContent({
        title: 'Insufficient Leave Balance',
        message: `You only have ${leaveBalance} days available. Please adjust your leave dates.`,
        type: 'warning'
      });
      setShowModal(true);
      return;
    }
    
    const newLeave = {
      id: Date.now(),
      employeeId: user.id,
      employeeName: user.name,
      leaveType: leaveFormTemplate.leaveType,
      startDate: leaveFormTemplate.startDate,
      endDate: leaveFormTemplate.endDate,
      reason: leaveFormTemplate.reason,
      daysRequested,
      status: 'pending',
      // Store additional template details
      position: leaveFormTemplate.position,
      department: leaveFormTemplate.department,
      salary: leaveFormTemplate.salary,
      commutation: leaveFormTemplate.commutation,
      contactAddress: leaveFormTemplate.contactAddress,
      filedDate: leaveFormTemplate.filedDate,
      createdAt: new Date().toISOString()
    };
    
    const allLeaves = JSON.parse(localStorage.getItem('leaves') || '[]');
    const updatedLeaves = [...allLeaves, newLeave];
    localStorage.setItem('leaves', JSON.stringify(updatedLeaves));
    setLeaves([...leaves, newLeave]);
    
    const notification = {
      id: Date.now(),
      type: 'leave',
      targetUserId: user.id,
      title: 'New Leave Request',
      message: `${user.name} has filed a ${leaveFormTemplate.leaveType} leave for ${daysRequested} days`,
      date: new Date().toISOString(),
      forRoles: ['admin', 'hr'],
      isRead: false
    };
    
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    localStorage.setItem('notifications', JSON.stringify([notification, ...allNotifications]));
    
    setShowLeaveFormModal(false);
    setModalContent({
      title: 'Leave Request Submitted',
      message: 'Your leave request has been submitted successfully! Notification sent to Admin and HR.',
      type: 'success'
    });
    setShowModal(true);
    setLeaveFormTemplate({
      ...leaveFormTemplate,
      leaveType: 'vacation',
      startDate: '',
      endDate: '',
      reason: '',
      commutation: 'none',
      filedDate: new Date().toISOString().split('T')[0]
    });
  };

  // Print leave form as PDF
  const printLeaveForm = (leave) => {
    const printWindow = window.open('', '_blank');
    const leaveTypeFormatted = leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1);
    const statusFormatted = leave.status.charAt(0).toUpperCase() + leave.status.slice(1);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Leave Request Form - ${leave.employeeName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; font-size: 12pt; padding: 20px; }
          .form-container { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 30px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
          .header h1 { font-size: 18pt; margin-bottom: 5px; }
          .header h2 { font-size: 14pt; font-weight: normal; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; text-decoration: underline; margin-bottom: 10px; }
          .info-row { display: flex; margin-bottom: 8px; }
          .info-label { width: 150px; font-weight: bold; }
          .info-value { flex: 1; border-bottom: 1px solid #000; padding-left: 5px; }
          .checkbox-group { margin: 10px 0; }
          .checkbox-item { margin-bottom: 5px; }
          .checkbox-box { display: inline-block; width: 15px; height: 15px; border: 1px solid #000; margin-right: 10px; }
          .checked { background: #000; }
          .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-box { width: 45%; text-align: center; }
          .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; }
          .status-approved { color: green; font-weight: bold; }
          .status-pending { color: orange; font-weight: bold; }
          .status-rejected { color: red; font-weight: bold; }
          @media print {
            body { padding: 0; }
            .form-container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <div class="header">
            <h1>LAND TRANSPORT OFFICE</h1>
            <h2>OFFICIAL LEAVE REQUEST FORM</h2>
          </div>
          
          <div class="section">
            <div class="info-row">
              <div class="info-label">Name:</div>
              <div class="info-value">${leave.employeeName || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Position:</div>
              <div class="info-value">${leave.position || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Department:</div>
              <div class="info-value">${leave.department || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Monthly Salary:</div>
              <div class="info-value">₱${leave.salary || '0.00'}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">TYPE OF LEAVE</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <span class="checkbox-box ${leave.leaveType === 'vacation' ? 'checked' : ''}"></span>
                Vacation Leave
              </div>
              <div class="checkbox-item">
                <span class="checkbox-box ${leave.leaveType === 'sick' ? 'checked' : ''}"></span>
                Sick Leave
              </div>
              <div class="checkbox-item">
                <span class="checkbox-box ${leave.leaveType === 'personal' ? 'checked' : ''}"></span>
                Personal Leave
              </div>
              <div class="checkbox-item">
                <span class="checkbox-box ${leave.leaveType === 'maternity' ? 'checked' : ''}"></span>
                Maternity Leave
              </div>
              <div class="checkbox-item">
                <span class="checkbox-box ${leave.leaveType === 'paternity' ? 'checked' : ''}"></span>
                Paternity Leave
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="info-row">
              <div class="info-label">Start Date:</div>
              <div class="info-value">${leave.startDate || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">End Date:</div>
              <div class="info-value">${leave.endDate || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">No. of Days:</div>
              <div class="info-value">${leave.daysRequested || '0'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Contact Address:</div>
              <div class="info-value">${leave.contactAddress || 'N/A'}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">REASON FOR LEAVE</div>
            <div style="border: 1px solid #000; padding: 10px; min-height: 60px;">
              ${leave.reason || 'No reason provided'}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">COMMUTATION</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <span class="checkbox-box ${leave.commutation === 'none' ? 'checked' : ''}"></span>
                Not Requested
              </div>
              <div class="checkbox-item">
                <span class="checkbox-box ${leave.commutation === 'required' ? 'checked' : ''}"></span>
                Requested
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="info-row">
              <div class="info-label">Date Filed:</div>
              <div class="info-value">${leave.filedDate || new Date(leave.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Status:</div>
              <div class="info-value status-${leave.status}">${statusFormatted}</div>
            </div>
          </div>
          
          <div class="signature-section">
            <div class="signature-box">
              <div>Approved By:</div>
              <div class="signature-line">Chief Signature</div>
            </div>
            <div class="signature-box">
              <div>Recommending Approval:</div>
              <div class="signature-line">Admin Signature</div>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <div style="border: 1px solid #000; padding: 15px; display: inline-block;">
              <strong>LTO IHREMS - Leave Management System</strong><br/>
              <span style="font-size: 10pt;">Form generated on ${new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="employee-layout">
      <header>
        <div className="header-left">
          <img src="/assets/lto.png" alt="LTO" className="logo" />
          <h1>LTO IHREMS - Employee Portal</h1>
        </div>
        <div className="header-right">
          <div className="notification-bell-wrapper">
            <span className="notification-bell">🔔</span>
            {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
          </div>
          <button className="profile-btn" onClick={() => setShowProfileModal(true)}>
            <span>{user.name}</span>
            <div className="avatar">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name?.charAt(0)
              )}
            </div>
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="employee-content">
        <div className="welcome-section">
          <h2>Welcome, {user.name}!</h2>
          <p>Manage your leaves, view payslips, and track your achievements.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-value">{leaveBalance}</div>
            <div className="stat-label">Available Leave Days</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{leaves.filter(l => l.status === 'pending').length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">{payrolls.length}</div>
            <div className="stat-label">Payslips</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{achievements.length}</div>
            <div className="stat-label">Achievements</div>
          </div>
        </div>

        <div className="employee-actions">
          <button className="action-btn primary" onClick={() => setShowLeaveFormModal(true)}>
            📝 Request Leave (Official Form)
          </button>
          <button className="action-btn secondary" onClick={() => setShowAchievementModal(true)}>
            🏆 Upload Achievement
          </button>
          <button className="action-btn secondary" onClick={() => setShowDocumentModal(true)}>
            📄 Upload Document
          </button>
        </div>

        <div className="info-sections">
          <div className="section">
            <h3>My Leave Requests</h3>
            {leaves.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(leave => (
                    <tr key={leave.id}>
                      <td>{leave.leaveType}</td>
                      <td>{leave.startDate}</td>
                      <td>{leave.endDate}</td>
                      <td>{leave.daysRequested}</td>
                      <td>
                        <span className={`status-badge ${leave.status}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>
                        {leave.status === 'approved' && (
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => printLeaveForm(leave)}
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                          >
                            🖨️ Print Form
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No leave requests yet.</p>
            )}
          </div>

          <div className="section">
            <h3>My Achievements</h3>
            {achievements.length > 0 ? (
              <div className="achievements-list">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="achievement-card">
                    <div className="achievement-header">
                      <h4>{achievement.title}</h4>
                      <span className={`status-badge ${achievement.status}`}>
                        {achievement.status}
                      </span>
                    </div>
                    <p>{achievement.description}</p>
                    <div className="achievement-date">
                      {new Date(achievement.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No achievements submitted yet.</p>
            )}
          </div>

          {/* My Documents Section */}
          <div className="section">
            <h3>My Documents</h3>
            {documents.length > 0 ? (
              <div className="documents-grid">
                {documents.map(doc => (
                  <div key={doc.id} className="document-card">
                    <div className="document-icon">📄</div>
                    <div className="document-info">
                      <h4>{doc.documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                      <p>{doc.description || 'No description'}</p>
                      <span className="document-date">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <a 
                      href={doc.fileData} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ marginTop: '10px' }}
                    >
                      View PDF
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No documents uploaded yet.</p>
            )}
          </div>

          <div className="section">
            <h3>My Payslips</h3>
            {payrolls.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Base Salary</th>
                    <th>Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map(payroll => (
                    <tr key={payroll.id}>
                      <td>{payroll.month}</td>
                      <td>{formatCurrency(payroll.baseSalary)}</td>
                      <td style={{ fontWeight: '600', color: '#059669' }}>
                        {formatCurrency(payroll.netSalary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No payslips available yet.</p>
            )}
          </div>
        </div>
      </div>

      {showLeaveModal && (
        <div className="modal" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Request Leave</h3>
            <div className="leave-balance-info">
              Available Leave Balance: <strong>{leaveBalance} days</strong>
            </div>
            <form onSubmit={handleLeaveSubmit}>
              <div className="form-group">
                <label>Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={e => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                >
                  <option value="vacation">Vacation Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})}
                  required
                />
              </div>
              {leaveForm.startDate && leaveForm.endDate && (
                <div className="days-preview">
                  Days to be deducted: <strong>
                    {calculateLeaveDays(leaveForm.startDate, leaveForm.endDate)}
                  </strong>
                </div>
              )}
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}
                  placeholder="Enter reason for leave"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowLeaveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Leave Request Form Template Modal */}
      {showLeaveFormModal && (
        <div className="modal" onClick={() => setShowLeaveFormModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3>📋 Official Leave Request Form</h3>
            <p style={{ marginBottom: '15px', color: '#6b7280', fontSize: '13px' }}>
              Land Transport Office - Official Leave Form Template
            </p>
            <div className="leave-balance-info">
              Available Leave Balance: <strong>{leaveBalance} days</strong>
            </div>
            <form onSubmit={handleLeaveFormTemplateSubmit}>
              {/* Employee Information Section */}
              <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '12px', color: '#374151', fontSize: '14px' }}>👤 Employee Information</h4>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={leaveFormTemplate.position}
                    onChange={e => setLeaveFormTemplate({...leaveFormTemplate, position: e.target.value})}
                    placeholder="Your position"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={leaveFormTemplate.department}
                    onChange={e => setLeaveFormTemplate({...leaveFormTemplate, department: e.target.value})}
                    placeholder="Your department"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Salary (₱)</label>
                  <input
                    type="number"
                    value={leaveFormTemplate.salary}
                    onChange={e => setLeaveFormTemplate({...leaveFormTemplate, salary: e.target.value})}
                    placeholder="Enter monthly salary"
                    required
                  />
                </div>
              </div>

              {/* Leave Type Section */}
              <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '12px', color: '#374151', fontSize: '14px' }}>📅 Type of Leave</h4>
                <div className="form-group">
                  <select
                    value={leaveFormTemplate.leaveType}
                    onChange={e => setLeaveFormTemplate({...leaveFormTemplate, leaveType: e.target.value})}
                    required
                  >
                    <option value="vacation">Vacation Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                    <option value="maternity">Maternity Leave (Female)</option>
                    <option value="paternity">Paternity Leave (Male)</option>
                  </select>
                </div>
              </div>

              {/* Leave Dates Section */}
              <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '12px', color: '#374151', fontSize: '14px' }}>📆 Leave Period</h4>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={leaveFormTemplate.startDate}
                    onChange={e => setLeaveFormTemplate({...leaveFormTemplate, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={leaveFormTemplate.endDate}
                    onChange={e => setLeaveFormTemplate({...leaveFormTemplate, endDate: e.target.value})}
                    required
                  />
                </div>
                {leaveFormTemplate.startDate && leaveFormTemplate.endDate && (
                  <div className="days-preview">
                    Days to be deducted: <strong>{calculateLeaveDays(leaveFormTemplate.startDate, leaveFormTemplate.endDate)}</strong>
                  </div>
                )}
              </div>

              {/* Reason and Contact Section */}
              <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '12px', color: '#374151', fontSize: '14px' }}>📝 Reason & Contact</h4>
                <div className="form-group">
                  <label>Reason for Leave</label>
                  <textarea
                    value={leaveFormTemplate.reason}
                    onChange={e => setLeaveFormTemplate({...leaveFormTemplate, reason: e.target.value})}
                    placeholder="Please provide detailed reason for your leave request..."
                    required
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Address During Leave</label>
                  <input
                    type="text"
                    value={leaveFormTemplate.contactAddress}
                    onChange={e => setLeaveFormTemplate({...leaveFormTemplate, contactAddress: e.target.value})}
                    placeholder="Where can you be reached during leave?"
                    required
                  />
                </div>
              </div>

              {/* Commutation Section */}
              <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '12px', color: '#374151', fontSize: '14px' }}>🚗 Commutation</h4>
                <div className="form-group">
                  <label>
                    <input
                      type="radio"
                      name="commutation"
                      value="none"
                      checked={leaveFormTemplate.commutation === 'none'}
                      onChange={e => setLeaveFormTemplate({...leaveFormTemplate, commutation: e.target.value})}
                      style={{ marginRight: '8px' }}
                    />
                    Not Requested
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="radio"
                      name="commutation"
                      value="required"
                      checked={leaveFormTemplate.commutation === 'required'}
                      onChange={e => setLeaveFormTemplate({...leaveFormTemplate, commutation: e.target.value})}
                      style={{ marginRight: '8px' }}
                    />
                    Requested
                  </label>
                </div>
              </div>

              {/* Date Filed */}
              <div className="form-group">
                <label>Date Filed</label>
                <input
                  type="date"
                  value={leaveFormTemplate.filedDate}
                  onChange={e => setLeaveFormTemplate({...leaveFormTemplate, filedDate: e.target.value})}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowLeaveFormModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  📤 Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAchievementModal && (
        <div className="modal" onClick={() => setShowAchievementModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Upload Achievement</h3>
            <form onSubmit={handleAchievementSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={achievementForm.title}
                  onChange={e => setAchievementForm({...achievementForm, title: e.target.value})}
                  placeholder="Achievement title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={achievementForm.description}
                  onChange={e => setAchievementForm({...achievementForm, description: e.target.value})}
                  placeholder="Describe your achievement"
                  required
                />
              </div>
              <div className="form-group">
                <label>Date Achieved</label>
                <input
                  type="date"
                  value={achievementForm.date}
                  onChange={e => setAchievementForm({...achievementForm, date: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAchievementModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="modal" onClick={() => setShowDocumentModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Upload Document</h3>
            <p style={{ marginBottom: '15px', color: '#6b7280', fontSize: '14px' }}>
              Upload required documents (PDF only): Marriage Certificate, Birth Certificate, Training Certificates, etc.
            </p>
            <form onSubmit={handleDocumentUpload}>
              <div className="form-group">
                <label>Document Type</label>
                <select
                  value={documentForm.documentType}
                  onChange={e => setDocumentForm({...documentForm, documentType: e.target.value})}
                  required
                >
                  <option value="birth_certificate">Birth Certificate</option>
                  <option value="marriage_certificate">Marriage Certificate</option>
                  <option value="training_certificate">Training Certificate</option>
                  <option value="other">Other Document</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  value={documentForm.description}
                  onChange={e => setDocumentForm({...documentForm, description: e.target.value})}
                  placeholder="e.g., Recent training from DOTr"
                />
              </div>
              <div className="form-group">
                <label>Select PDF File</label>
                <input
                  type="file"
                  id="document-file"
                  accept="application/pdf"
                  required
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Only PDF files are allowed
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowDocumentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={modalContent.title}
        type={modalContent.type}
      >
        <p>{modalContent.message}</p>
      </Modal>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>My Profile</h3>
            <div className="form-group">
              <label>Profile Picture</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profileForm.profilePicture ? (
                    <img src={profileForm.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '24px', color: '#6b7280' }}>👤</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfileForm({...profileForm, profilePicture: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: 'none' }}
                  id="emp-profile-pic"
                />
                <label htmlFor="emp-profile-pic" style={{ padding: '8px 16px', background: '#f3f4f6', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                  📷 Choose Photo
                </label>
                {profileForm.profilePicture && (
                  <button 
                    type="button" 
                    onClick={() => setProfileForm({...profileForm, profilePicture: ''})}
                    style={{ padding: '8px 16px', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#dc2626', fontSize: '14px' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
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
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowProfileModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleProfileSave}>
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
