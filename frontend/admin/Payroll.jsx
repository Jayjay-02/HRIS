import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './Admin.css';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    month: '',
    baseSalary: '',
    deductions: '',
    bonuses: ''
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadPayrolls();
    loadUsers();
  }, []);

  const loadPayrolls = () => {
    const payrollData = JSON.parse(localStorage.getItem('payroll') || '[]');
    setPayrolls(payrollData);
  };

  const loadUsers = () => {
    const usersData = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(usersData.filter(u => u.role === 'employee'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const netSalary = parseFloat(formData.baseSalary) + parseFloat(formData.bonuses || 0) - parseFloat(formData.deductions || 0);
    
    const newPayroll = {
      id: Date.now(),
      ...formData,
      netSalary,
      createdAt: new Date().toISOString()
    };
    
    const updatedPayrolls = [...payrolls, newPayroll];
    localStorage.setItem('payroll', JSON.stringify(updatedPayrolls));
    setPayrolls(updatedPayrolls);
    
    // Log activity
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const newActivity = {
      action: 'Generated payroll',
      user: formData.employeeName,
      date: new Date().toLocaleDateString(),
      status: 'completed'
    };
    localStorage.setItem('activities', JSON.stringify([newActivity, ...activities]));
    
    closeModal();
  };

  const handleEmployeeChange = (e) => {
    const user = users.find(u => u.id === parseInt(e.target.value));
    setFormData({
      ...formData,
      employeeId: e.target.value,
      employeeName: user ? user.name : ''
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      employeeId: '',
      employeeName: '',
      month: '',
      baseSalary: '',
      deductions: '',
      bonuses: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="payroll-page">
        <h2 className="page-title">Payroll Management</h2>
        
        {/* Stats */}
        <div className="dashboard-cards" style={{ marginBottom: '24px' }}>
          <div className="card">
            <div className="card-value">{payrolls.length}</div>
            <div className="card-subtitle">Total Records</div>
          </div>
          <div className="card">
            <div className="card-value">
              {formatCurrency(payrolls.reduce((sum, p) => sum + (parseFloat(p.netSalary) || 0), 0))}
            </div>
            <div className="card-subtitle">Total Payroll</div>
          </div>
          <div className="card">
            <div className="card-value">{users.length}</div>
            <div className="card-subtitle">Active Employees</div>
          </div>
        </div>

        <div className="data-table">
          <div className="table-header">
            <h3 className="table-title">Payroll Records</h3>
            <div className="table-actions">
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                ➕ Generate Payroll
              </button>
            </div>
          </div>
          
          {payrolls.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Base Salary</th>
                  <th>Bonuses</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Date Generated</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.id}>
                    <td>{payroll.employeeName}</td>
                    <td>{payroll.month}</td>
                    <td>{formatCurrency(payroll.baseSalary)}</td>
                    <td>{formatCurrency(payroll.bonuses || 0)}</td>
                    <td>{formatCurrency(payroll.deductions || 0)}</td>
                    <td style={{ fontWeight: '600', color: '#059669' }}>
                      {formatCurrency(payroll.netSalary)}
                    </td>
                    <td>{new Date(payroll.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No payroll records yet. Click "Generate Payroll" to create one.
            </div>
          )}
        </div>

        {/* Generate Payroll Modal */}
        {showModal && (
          <div className="form-modal" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Generate Payroll</h3>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Select Employee</label>
                    <select
                      value={formData.employeeId}
                      onChange={handleEmployeeChange}
                      required
                    >
                      <option value="">Select employee</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Month</label>
                    <input
                      type="month"
                      value={formData.month}
                      onChange={e => setFormData({...formData, month: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Base Salary (PHP)</label>
                    <input
                      type="number"
                      value={formData.baseSalary}
                      onChange={e => setFormData({...formData, baseSalary: e.target.value})}
                      placeholder="Enter base salary"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Bonuses (PHP)</label>
                    <input
                      type="number"
                      value={formData.bonuses}
                      onChange={e => setFormData({...formData, bonuses: e.target.value})}
                      placeholder="Enter bonuses (optional)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Deductions (PHP)</label>
                    <input
                      type="number"
                      value={formData.deductions}
                      onChange={e => setFormData({...formData, deductions: e.target.value})}
                      placeholder="Enter deductions (optional)"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Generate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Payroll;
