import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import Modal from '../components/Modal';
import './Admin.css';

const Reports = () => {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [reportType, setReportType] = useState('overview');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info', action: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(JSON.parse(localStorage.getItem('users') || '[]'));
    setLeaves(JSON.parse(localStorage.getItem('leaves') || '[]'));
    setPayrolls(JSON.parse(localStorage.getItem('payroll') || '[]'));
    setAchievements(JSON.parse(localStorage.getItem('achievements') || '[]'));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Convert data to CSV format
  const convertToCSV = (data, headers) => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    data.forEach(row => {
      const values = headers.map(header => {
        const key = header.toLowerCase().replace(/ /g, '');
        let value = row[key] || row[header] || '';
        
        // Escape quotes and wrap in quotes if contains comma
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

  // Download CSV file
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

  // Export Users to Excel
  const exportUsers = () => {
    const userData = users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Position: u.position || '',
      Role: u.role,
      Created: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
    }));
    
    const headers = ['ID', 'Name', 'Email', 'Position', 'Role', 'Created'];
    const csv = convertToCSV(userData, headers);
    downloadCSV(csv, 'employees');
  };

  // Export Leaves to Excel
  const exportLeaves = () => {
    const leaveData = leaves.map(l => ({
      ID: l.id,
      Employee: l.employeeName,
      Type: l.leaveType,
      StartDate: l.startDate,
      EndDate: l.endDate,
      Days: l.daysRequested,
      Reason: l.reason,
      Status: l.status,
      Submitted: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A'
    }));
    
    const headers = ['ID', 'Employee', 'Type', 'StartDate', 'EndDate', 'Days', 'Reason', 'Status', 'Submitted'];
    const csv = convertToCSV(leaveData, headers);
    downloadCSV(csv, 'leaves');
  };

  // Export Achievements to Excel
  const exportAchievements = () => {
    const achievementData = achievements.map(a => ({
      ID: a.id,
      Employee: a.employeeName,
      Title: a.title,
      Description: a.description,
      Date: a.date,
      Status: a.status,
      Submitted: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'
    }));
    
    const headers = ['ID', 'Employee', 'Title', 'Description', 'Date', 'Status', 'Submitted'];
    const csv = convertToCSV(achievementData, headers);
    downloadCSV(csv, 'achievements');
  };

  // Export Payroll to Excel
  const exportPayroll = () => {
    const payrollData = payrolls.map(p => ({
      ID: p.id,
      Employee: p.employeeName,
      Period: p.period,
      BasicSalary: p.basicSalary,
      Deductions: p.deductions,
      NetSalary: p.netSalary,
      Created: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
    }));
    
    const headers = ['ID', 'Employee', 'Period', 'BasicSalary', 'Deductions', 'NetSalary', 'Created'];
    const csv = convertToCSV(payrollData, headers);
    downloadCSV(csv, 'payroll');
  };

  // Export All Data
  const exportAll = () => {
    // Create a comprehensive report
    const allData = [
      { Section: 'EMPLOYEES', data: users.map(u => ({ Name: u.name, Email: u.email, Position: u.position || '', Role: u.role })) },
      { Section: 'LEAVES', data: leaves.map(l => ({ Employee: l.employeeName, Type: l.leaveType, Status: l.status })) },
      { Section: 'ACHIEVEMENTS', data: achievements.map(a => ({ Employee: a.employeeName, Title: a.title, Status: a.status })) },
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

    downloadCSV(csvContent, 'full_report');
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const approvedAchievements = achievements.filter(a => a.status === 'approved');

  // Show confirmation modal for export
  const confirmExport = (action, title, message) => {
    setModalContent({ title, message, type: 'confirm', action });
    setShowConfirmModal(true);
  };

  // Execute export after confirmation
  const executeExport = () => {
    if (modalContent.action) {
      modalContent.action();
    }
    setShowConfirmModal(false);
  };

  return (
    <AdminLayout>
      <div className="reports-page">
        <h2 className="page-title">System Reports</h2>
        
        {/* Report Type Selection */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${reportType === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`btn ${reportType === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('users')}
          >
            👥 Employee Report
          </button>
          <button 
            className={`btn ${reportType === 'leaves' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('leaves')}
          >
            📅 Leave Report
          </button>
          <button 
            className={`btn ${reportType === 'achievements' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('achievements')}
          >
            🏆 Achievement Report
          </button>
          <button 
            className={`btn ${reportType === 'payroll' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('payroll')}
          >
            💰 Payroll Report
          </button>
        </div>

        {/* Export Buttons */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => confirmExport(exportAll, 'Export All Data', 'Are you sure you want to export all system data to Excel?')}>
            📥 Export All Data
          </button>
          {reportType === 'users' && (
            <button className="btn btn-secondary" onClick={() => confirmExport(exportUsers, 'Export Employees', 'Are you sure you want to export employee details to Excel?')}>
              📥 Export Employees
            </button>
          )}
          {reportType === 'leaves' && (
            <button className="btn btn-secondary" onClick={() => confirmExport(exportLeaves, 'Export Leaves', 'Are you sure you want to export leave records to Excel?')}>
              📥 Export Leaves
            </button>
          )}
          {reportType === 'achievements' && (
            <button className="btn btn-secondary" onClick={() => confirmExport(exportAchievements, 'Export Achievements', 'Are you sure you want to export achievement records to Excel?')}>
              📥 Export Achievements
            </button>
          )}
          {reportType === 'payroll' && (
            <button className="btn btn-secondary" onClick={() => confirmExport(exportPayroll, 'Export Payroll', 'Are you sure you want to export payroll records to Excel?')}>
              📥 Export Payroll
            </button>
          )}
        </div>

        {/* Overview Report */}
        {reportType === 'overview' && (
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Total Employees</span>
                <div className="card-icon blue">👥</div>
              </div>
              <div className="card-value">{users.length}</div>
              <div className="card-subtitle">Registered in system</div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <span className="card-title">Pending Leaves</span>
                <div className="card-icon yellow">📅</div>
              </div>
              <div className="card-value">{pendingLeaves.length}</div>
              <div className="card-subtitle">Awaiting approval</div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <span className="card-title">Total Achievements</span>
                <div className="card-icon purple">🏆</div>
              </div>
              <div className="card-value">{achievements.length}</div>
              <div className="card-subtitle">{approvedAchievements.length} approved</div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <span className="card-title">Total Payroll</span>
                <div className="card-icon green">💰</div>
              </div>
              <div className="card-value">{payrolls.length}</div>
              <div className="card-subtitle">Records generated</div>
            </div>
          </div>
        )}

        {/* User Report */}
        {reportType === 'users' && (
          <div className="data-table">
            <div className="table-header">
              <h3 className="table-title">Employee Report</h3>
            </div>
            {users.length > 0 ? (
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Position</th>
                    <th>Role</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.position || '-'}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                No employees found
              </div>
            )}
          </div>
        )}

        {/* Leave Report */}
        {reportType === 'leaves' && (
          <div className="data-table">
            <div className="table-header">
              <h3 className="table-title">Leave Report</h3>
            </div>
            {leaves.length > 0 ? (
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(leave => (
                    <tr key={leave.id}>
                      <td>{leave.employeeName}</td>
                      <td>{leave.leaveType}</td>
                      <td>{leave.startDate}</td>
                      <td>{leave.endDate}</td>
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
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                No leave records found
              </div>
            )}
          </div>
        )}

        {/* Achievement Report */}
        {reportType === 'achievements' && (
          <div className="data-table">
            <div className="table-header">
              <h3 className="table-title">Achievement Report</h3>
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
                      <td>{achievement.date}</td>
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
                No achievements found
              </div>
            )}
          </div>
        )}

        {/* Payroll Report */}
        {reportType === 'payroll' && (
          <div className="data-table">
            <div className="table-header">
              <h3 className="table-title">Payroll Report</h3>
            </div>
            {payrolls.length > 0 ? (
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Basic Salary</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map(payroll => (
                    <tr key={payroll.id}>
                      <td>{payroll.employeeName}</td>
                      <td>{payroll.period}</td>
                      <td>{formatCurrency(payroll.basicSalary)}</td>
                      <td>{formatCurrency(payroll.deductions)}</td>
                      <td style={{ fontWeight: '600' }}>{formatCurrency(payroll.netSalary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                No payroll records found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={modalContent.title}
        type={modalContent.type}
        confirmText="Yes, Export"
        cancelText="Cancel"
        showCancel={true}
        showConfirm={true}
        onConfirm={executeExport}
      >
        <p>{modalContent.message}</p>
      </Modal>
    </AdminLayout>
  );
};

export default Reports;
