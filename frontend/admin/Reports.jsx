import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './Admin.css';

const Reports = () => {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDepartmentView, setShowDepartmentView] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(JSON.parse(localStorage.getItem('users') || '[]'));
    setLeaves(JSON.parse(localStorage.getItem('leaves') || '[]'));
    setAchievements(JSON.parse(localStorage.getItem('achievements') || '[]'));
    setDocuments(JSON.parse(localStorage.getItem('documents') || '[]'));
  };

  // Download Excel report for a specific employee
  const downloadEmployeeReport = (employee) => {
    const empLeaves = leaves.filter(l => l.employeeId === employee.id || l.employeeName === employee.name);
    const empAchievements = achievements.filter(a => a.employeeId === employee.id || a.employeeName === employee.name);
    const empDocuments = documents.filter(d => d.employeeId === employee.id || d.employeeName === employee.name);

    let csvContent = '';

    // Employee Details
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

    // Documents Posted
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

    // Leave Records
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

    // Achievements
    csvContent += 'ACHIEVEMENTS\n';
    if (empAchievements.length > 0) {
      csvContent += 'Title,Description,Date,Status\n';
      empAchievements.forEach(ach => {
        csvContent += `"${(ach.title || '').replace(/"/g, '""')}","${(ach.description || '').replace(/"/g, '""')}",${ach.date || ''},${ach.status || ''}\n`;
      });
    } else {
      csvContent += 'No achievements found\n';
    }

    // Download as Excel
    const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${employee.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.xls`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all employees report
  const downloadAllReport = () => {
    let csvContent = '';

    csvContent += 'ALL EMPLOYEES REPORT\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Summary
    csvContent += 'SUMMARY\n';
    csvContent += `Total Employees,${users.length}\n`;
    csvContent += `Total Leave Records,${leaves.length}\n`;
    csvContent += `Total Achievements,${achievements.length}\n`;
    csvContent += `Total Documents,${documents.length}\n\n`;

    // All Employees
    csvContent += 'EMPLOYEE LIST\n';
    csvContent += 'Name,Email,Position,Role,Phone,Date Registered\n';
    users.forEach(u => {
      csvContent += `"${u.name}",${u.email},"${u.position || 'N/A'}",${u.role},${u.phone || 'N/A'},${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}\n`;
    });
    csvContent += '\n';

    // All Documents
    csvContent += 'ALL DOCUMENTS\n';
    if (documents.length > 0) {
      csvContent += 'Employee,Title,Type,Date,Status\n';
      documents.forEach(doc => {
        csvContent += `"${doc.employeeName || ''}","${(doc.title || '').replace(/"/g, '""')}","${doc.type || ''}",${doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'},${doc.status || 'N/A'}\n`;
      });
    } else {
      csvContent += 'No documents found\n';
    }
    csvContent += '\n';

    // All Leaves
    csvContent += 'ALL LEAVE RECORDS\n';
    if (leaves.length > 0) {
      csvContent += 'Employee,Leave Type,Start Date,End Date,Days,Reason,Status\n';
      leaves.forEach(leave => {
        csvContent += `"${leave.employeeName || ''}",${leave.leaveType || ''},${leave.startDate || ''},${leave.endDate || ''},${leave.daysRequested || ''},"${(leave.reason || '').replace(/"/g, '""')}",${leave.status || ''}\n`;
      });
    } else {
      csvContent += 'No leave records found\n';
    }
    csvContent += '\n';

    // All Achievements
    csvContent += 'ALL ACHIEVEMENTS\n';
    if (achievements.length > 0) {
      csvContent += 'Employee,Title,Description,Date,Status\n';
      achievements.forEach(ach => {
        csvContent += `"${ach.employeeName || ''}","${(ach.title || '').replace(/"/g, '""')}","${(ach.description || '').replace(/"/g, '""')}",${ach.date || ''},${ach.status || ''}\n`;
      });
    } else {
      csvContent += 'No achievements found\n';
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `All_Employees_Report_${new Date().toISOString().split('T')[0]}.xls`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const approvedAchievements = achievements.filter(a => a.status === 'approved');
  const employeeUsers = users.filter(u => u.role !== 'admin');

  // Get unique departments with chiefs
  const getDepartments = () => {
    const deptMap = {};
    users.forEach(u => {
      if (u.department && u.role === 'head') {
        if (!deptMap[u.department]) {
          deptMap[u.department] = { name: u.department, chief: u, employees: [] };
        }
      }
    });
    // Add departments without chiefs
    users.forEach(u => {
      if (u.department && !deptMap[u.department]) {
        deptMap[u.department] = { name: u.department, chief: null, employees: [] };
      }
    });
    // Add employees to their departments
    users.forEach(u => {
      if (u.department && u.role !== 'admin') {
        if (deptMap[u.department]) {
          deptMap[u.department].employees.push(u);
        }
      }
    });
    return Object.values(deptMap);
  };

  const departments = getDepartments();

  // Download department report as Excel
  const downloadDepartmentReport = (dept) => {
    const deptEmployees = users.filter(u => u.department === dept.name && u.role !== 'admin');
    
    let csvContent = '';
    
    // Department Header
    csvContent += `DEPARTMENT REPORT - ${dept.name}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Department Chief
    csvContent += 'DEPARTMENT CHIEF\n';
    if (dept.chief) {
      csvContent += `Name,${dept.chief.name}\n`;
      csvContent += `Email,${dept.chief.email}\n`;
      csvContent += `Position,${dept.chief.position || 'N/A'}\n`;
      csvContent += `Phone,${dept.chief.phone || 'N/A'}\n\n`;
    } else {
      csvContent += 'No chief assigned\n\n';
    }
    
    // Employee List
    csvContent += 'EMPLOYEES UNDER THIS DEPARTMENT\n';
    csvContent += 'Name,Email,Position,Role,Phone\n';
    deptEmployees.forEach(emp => {
      csvContent += `"${emp.name}",${emp.email},"${emp.position || 'N/A'}",${emp.role},${emp.phone || 'N/A'}\n`;
    });
    csvContent += '\n';
    
    // Employee Details with Achievements and Leaves
    deptEmployees.forEach(emp => {
      const empLeaves = leaves.filter(l => l.employeeId === emp.id || l.employeeName === emp.name);
      const empAchievements = achievements.filter(a => a.employeeId === emp.id || a.employeeName === emp.name);
      
      csvContent += `EMPLOYEE: ${emp.name}\n`;
      csvContent += 'Position,Achievement,Leave\n';
      csvContent += `${emp.position || 'N/A'},,`;
      
      // Achievements
      csvContent += '\nACHIEVEMENTS\n';
      csvContent += 'Title,Description,Date,Status\n';
      if (empAchievements.length > 0) {
        empAchievements.forEach(ach => {
          csvContent += `"${ach.title || ''}","${(ach.description || '').replace(/"/g, '""')}",${ach.date || ''},${ach.status || ''}\n`;
        });
      } else {
        csvContent += 'No achievements\n';
      }
      
      // Leaves
      csvContent += '\nLEAVE RECORDS\n';
      csvContent += 'Leave Type,Start Date,End Date,Days,Reason,Status\n';
      if (empLeaves.length > 0) {
        empLeaves.forEach(leave => {
          csvContent += `${leave.leaveType || ''},${leave.startDate || ''},${leave.endDate || ''},${leave.daysRequested || ''},"${(leave.reason || '').replace(/"/g, '""')}",${leave.status || ''}\n`;
        });
      } else {
        csvContent += 'No leave records\n';
      }
      csvContent += '\n';
    });

    // Download as Excel
    const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${dept.name.replace(/\s+/g, '_')}_Department_Report_${new Date().toISOString().split('T')[0]}.xls`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="reports-page">
        <h2 className="page-title">📊 Reports</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Click on an employee to directly download their complete report as Excel file.
        </p>

        {/* Stats Overview */}
        <div className="dashboard-cards" style={{ marginBottom: '24px' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Total Employees</span>
              <div className="card-icon blue">👥</div>
            </div>
            <div className="card-value">{employeeUsers.length}</div>
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
              <span className="card-title">Documents</span>
              <div className="card-icon green">📄</div>
            </div>
            <div className="card-value">{documents.length}</div>
            <div className="card-subtitle">Total uploaded</div>
          </div>
        </div>

        {/* Download All Button */}
        <div style={{ marginBottom: '24px' }}>
          <button 
            className="btn btn-primary" 
            onClick={downloadAllReport}
            style={{ fontSize: '15px', padding: '12px 24px' }}
          >
            📥 Download All Employees Report (Excel)
          </button>
        </div>

        {/* Department Reports Section */}
        <div className="data-table" style={{ marginBottom: '24px' }}>
          <div className="table-header">
            <h3 className="table-title">📁 Department Reports</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
              Click on a department to download its complete report with chief, employees, achievements, and leave records.
            </p>
          </div>
          {departments.length > 0 ? (
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {departments.map((dept, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px', 
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: '#f9fafb'
                  }}
                  onClick={() => downloadDepartmentReport(dept)}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#1a365d'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: '#1a365d', 
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      🏢
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', color: '#1a365d' }}>{dept.name}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{dept.employees.length} employees</p>
                    </div>
                  </div>
                  
                  {dept.chief ? (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>👤 Department Chief:</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{dept.chief.name}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{dept.chief.position || 'Position not set'}</p>
                    </div>
                  ) : (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>⚠️ No chief assigned</p>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '16px' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', fontSize: '13px', padding: '10px' }}
                    >
                      📥 Download {dept.name} Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No departments found. Assign departments to employees to see reports.
            </div>
          )}
        </div>

        {/* Employee List - Click to Download */}
        <div className="data-table">
          <div className="table-header">
            <h3 className="table-title">Employee Reports - Click to Download</h3>
          </div>
          {employeeUsers.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Role</th>
                  <th>Leaves</th>
                  <th>Achievements</th>
                  <th>Documents</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employeeUsers.map(user => {
                  const userLeaves = leaves.filter(l => l.employeeId === user.id || l.employeeName === user.name);
                  const userAchievements = achievements.filter(a => a.employeeId === user.id || a.employeeName === user.name);
                  const userDocuments = documents.filter(d => d.employeeId === user.id || d.employeeName === user.name);
                  
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#1a365d',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            fontSize: '13px'
                          }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'E'}
                          </div>
                          <span style={{ fontWeight: '500' }}>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.position || <span style={{ color: '#9ca3af' }}>N/A</span>}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td>{userLeaves.length}</td>
                      <td>{userAchievements.length}</td>
                      <td>{userDocuments.length}</td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          style={{ fontSize: '12px', padding: '6px 14px', background: '#059669', border: 'none' }}
                          onClick={() => downloadEmployeeReport(user)}
                        >
                          📥 Download Excel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No employees found
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
