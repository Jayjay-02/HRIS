import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import ltoLogo from '../assets/lto.png';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in and redirect to appropriate dashboard
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    if (user && token) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'head' || user.role === 'chief') {
        navigate('/head/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    }
  }, [navigate]);

  // Initialize admin user on first load
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      // Create default admin user
      const adminUser = {
        id: 1,
        name: 'Administrator',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
      };
      // Create default chief user
      const chiefUser = {
        id: 2,
        name: 'Jay Satore',
        email: 'satorejay255@gmail.com',
        password: 'chief123',
        role: 'chief',
        department: 'IT',
        position: 'Head'
      };
      localStorage.setItem('users', JSON.stringify([adminUser, chiefUser]));
    }
  }, []);

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user with matching email and password
      const user = users.find(u => 
        u.email === formData.email && u.password === formData.password
      );

      if (user) {
        // Store token and user data
        const token = btoa(user.id + ':' + Date.now());
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect based on user role using React Router
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'head' || user.role === 'chief') {
          navigate('/head/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <img 
                src={ltoLogo}
                alt="LTO Logo" 
                className="lto-logo"
              />
            </div>
            <h1>LTO Integrated Human Resource and Employee Management System</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="form-input"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input"
                  autoComplete="current-password"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>
              <span className="forgot-password">
                Forgot Password?
              </span>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Sign In'
              )}
            </button>

            <button
              type="button"
              onClick={handleClearData}
              style={{
                marginTop: '10px',
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'underline'
              }}
            >
              Clear localStorage & Reset
            </button>
          </form>

          <div className="login-footer">
            <p>© 2026 LTO Integrated Human Resource and Employee Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
