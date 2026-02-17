import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './admin/AdminDashboard';
import Users from './admin/Users';
import Leaves from './admin/Leaves';
import PromoteEmployee from './admin/Payroll';
import Reports from './admin/Reports';
import Logs from './admin/Logs';
import Settings from './admin/Settings';
import Profile from './admin/Profile';
import Achievements from './admin/Achievements';
import HeadDashboard from './head/HeadDashboard';
import EmployeeDashboard from './employee/EmployeeDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'head' || user.role === 'chief') return <Navigate to="/head/dashboard" replace />;
    if (user.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/employees" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/leaves" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Leaves />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/payroll" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PromoteEmployee />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/logs" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Logs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/achievements" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Achievements />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        
        {/* Head/Chief Routes */}
        <Route 
          path="/head/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['head', 'chief']}>
              <HeadDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Employee Routes */}
        <Route 
          path="/employee/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
