import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import Modal from '../components/Modal';
import './Admin.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: 'LTO Integrated Human Resource and Employee Management System',
    companyAcronym: 'LTO-IHREMS',
    adminEmail: 'admin@gmail.com',
    timezone: 'Asia/Manila',
    leaveBalance: 15,
    payrollDay: 15,
    allowOvertime: true,
    requireApproval: true
  });
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    
    setModalContent({
      title: 'Settings Saved',
      message: 'Your settings have been saved successfully!',
      type: 'success'
    });
    setShowModal(true);
    setLoading(false);
  };

  const handleClearData = () => {
    setModalContent({
      title: 'Clear All Data',
      message: 'Are you sure you want to clear all data? This action cannot be undone.',
      type: 'warning',
      onConfirm: () => {
        localStorage.clear();
        setShowModal(false);
        window.location.reload();
      }
    });
    setShowModal(true);
  };

  const handleExportData = () => {
    // Get all data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const leaves = JSON.parse(localStorage.getItem('leaves') || '[]');
    const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const promotionHistory = JSON.parse(localStorage.getItem('promotionHistory') || '[]');
    
    let csvContent = '';
    
    // Summary
    csvContent += 'LTO IHREMS DATA EXPORT\n';
    csvContent += `Exported: ${new Date().toLocaleString()}\n\n`;
    
    csvContent += 'SUMMARY\n';
    csvContent += `Total Users,${users.length}\n`;
    csvContent += `Total Leave Records,${leaves.length}\n`;
    csvContent += `Total Achievements,${achievements.length}\n`;
    csvContent += `Total Documents,${documents.length}\n`;
    csvContent += `Total Promotions,${promotionHistory.length}\n\n`;
    
    // Users
    csvContent += 'USERS\n';
    csvContent += 'Name,Email,Role,Position,Department,Phone,Address\n';
    users.forEach(u => {
      csvContent += `"${u.name}",${u.email},${u.role},"${u.position || ''}","${u.department || ''}","${u.phone || ''}","${(u.address || '').replace(/"/g, '""')}"\n`;
    });
    csvContent += '\n';
    
    // Leaves
    csvContent += 'LEAVE RECORDS\n';
    csvContent += 'Employee,Type,Start Date,End Date,Days,Reason,Status\n';
    leaves.forEach(l => {
      csvContent += `"${l.employeeName || ''}",${l.leaveType || ''},${l.startDate || ''},${l.endDate || ''},${l.daysRequested || 0},"${(l.reason || '').replace(/"/g, '""')}",${l.status || ''}\n`;
    });
    csvContent += '\n';
    
    // Achievements
    csvContent += 'ACHIEVEMENTS\n';
    csvContent += 'Employee,Title,Description,Date,Status\n';
    achievements.forEach(a => {
      csvContent += `"${a.employeeName || ''}","${(a.title || '').replace(/"/g, '""')}","${(a.description || '').replace(/"/g, '""')}",${a.date || ''},${a.status || ''}\n`;
    });
    csvContent += '\n';
    
    // Promotions
    csvContent += 'PROMOTION HISTORY\n';
    csvContent += 'Employee,Old Position,New Position,Promoted By,Date\n';
    promotionHistory.forEach(p => {
      csvContent += `"${p.employeeName}","${p.oldPosition}","${p.newPosition}","${p.promotedBy}",${p.promotedAt ? new Date(p.promotedAt).toLocaleDateString() : ''}\n`;
    });
    
    // Download as Excel
    const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lto-hrems-export-${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    
    setModalContent({
      title: 'Export Complete',
      message: 'Your data has been exported successfully to Excel!',
      type: 'success'
    });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="settings-page">
        <h2 className="page-title">System Settings</h2>
        
        <div className="data-table">
          <div className="table-header">
            <h3 className="table-title">General Settings</h3>
          </div>
          
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={e => setSettings({...settings, companyName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Company Acronym</label>
                <input
                  type="text"
                  value={settings.companyAcronym}
                  onChange={e => setSettings({...settings, companyAcronym: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={e => setSettings({...settings, adminEmail: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={e => setSettings({...settings, timezone: e.target.value})}
                >
                  <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '16px' }}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Leave Settings */}
        <div className="data-table" style={{ marginTop: '24px' }}>
          <div className="table-header">
            <h3 className="table-title">Leave & Payroll Settings</h3>
          </div>
          
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div className="form-group">
                <label>Annual Leave Balance (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.leaveBalance}
                  onChange={e => setSettings({...settings, leaveBalance: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="form-group">
                <label>Payroll Day (Monthly)</label>
                <select
                  value={settings.payrollDay}
                  onChange={e => setSettings({...settings, payrollDay: parseInt(e.target.value)})}
                >
                  {[...Array(28)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.allowOvertime}
                    onChange={e => setSettings({...settings, allowOvertime: e.target.checked})}
                    style={{ width: 'auto' }}
                  />
                  Allow Overtime Requests
                </label>
              </div>
              
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.requireApproval}
                    onChange={e => setSettings({...settings, requireApproval: e.target.checked})}
                    style={{ width: 'auto' }}
                  />
                  Require Leave Approval
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="data-table" style={{ marginTop: '24px' }}>
          <div className="table-header">
            <h3 className="table-title">Data Management</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={handleExportData} className="btn btn-secondary">
                📥 Export Data
              </button>
              <button onClick={handleClearData} className="btn btn-danger">
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="data-table" style={{ marginTop: '24px' }}>
          <div className="table-header">
            <h3 className="table-title">System Information</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Version</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>1.0.0</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Build</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>2026.02.16</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Framework</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>React.js + Vite</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Database</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>LocalStorage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal
          title={modalContent.title}
          message={modalContent.message}
          type={modalContent.type}
          onClose={() => setShowModal(false)}
          onConfirm={modalContent.onConfirm}
        />
      )}
    </AdminLayout>
  );
};

export default Settings;
