import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePicture: '',
    position: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      profilePicture: user.profilePicture || '',
      position: user.position || '',
      department: user.department || ''
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, ...formData };
        }
        return u;
      });

      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...formData }));
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile');
    }

    setLoading(false);
  };

  const removeProfilePicture = () => {
    setFormData({ ...formData, profilePicture: '' });
  };

  return (
    <AdminLayout>
      <div className="profile-page">
        <h1 className="dashboard-title">My Profile</h1>
        <p className="welcome-text">Manage your account information</p>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profile" className="avatar-img" />
              ) : (
                currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'
              )}
            </div>
            <div className="profile-info">
              <h2>{currentUser?.name || 'Administrator'}</h2>
              <span className="role-badge admin">{currentUser?.role || 'Admin'}</span>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {currentUser?.position && (
                  <span style={{ 
                    background: '#e0e7ff', 
                    color: '#3730a3', 
                    padding: '4px 12px', 
                    borderRadius: '20px',
                    fontSize: '13px'
                  }}>
                    💼 {currentUser.position}
                  </span>
                )}
                {currentUser?.department && (
                  <span style={{ 
                    background: '#dcfce7', 
                    color: '#166534', 
                    padding: '4px 12px', 
                    borderRadius: '20px',
                    fontSize: '13px'
                  }}>
                    🏢 {currentUser.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {message && (
              <div className={`alert ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <div className="form-group">
              <label>Profile Picture</label>
              <div className="profile-picture-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicture}
                  id="profile-picture"
                  className="file-input"
                />
                <label htmlFor="profile-picture" className="file-label">
                  📷 Choose Photo
                </label>
                {formData.profilePicture && (
                  <button type="button" onClick={removeProfilePicture} className="remove-btn">
                    Remove
                  </button>
                )}
                {formData.profilePicture && (
                  <div className="preview-picture">
                    <img src={formData.profilePicture} alt="Preview" />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Position</label>
              <input
                type="text"
                name="position"
                value={formData.position || ''}
                onChange={handleChange}
                placeholder="Enter your position"
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleChange}
                placeholder="Enter your department"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <style>{`
          .profile-page {
            max-width: 600px;
          }

          .profile-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            overflow: hidden;
          }

          .profile-header {
            padding: 32px;
            background: linear-gradient(135deg, #1a365d, #2c5282);
            display: flex;
            align-items: center;
            gap: 20px;
          }

          .profile-avatar-large {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #1a365d;
            font-weight: 700;
            font-size: 32px;
            overflow: hidden;
          }

          .profile-avatar-large .avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .profile-info h2 {
            color: white;
            font-size: 24px;
            margin-bottom: 8px;
          }

          .profile-form {
            padding: 32px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s;
          }

          .form-group input:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: #1a365d;
            box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
          }

          .profile-picture-upload {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px;
          }

          .file-input {
            display: none;
          }

          .file-label {
            display: inline-block;
            padding: 10px 20px;
            background: #f3f4f6;
            color: #374151;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
          }

          .file-label:hover {
            background: #e5e7eb;
          }

          .remove-btn {
            padding: 10px 20px;
            background: #fee2e2;
            color: #dc2626;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
          }

          .remove-btn:hover {
            background: #fecaca;
          }

          .preview-picture {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #e5e7eb;
          }

          .preview-picture img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .form-actions {
            margin-top: 24px;
          }

          .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
          }

          .alert.success {
            background: #d1fae5;
            color: #059669;
          }

          .alert.error {
            background: #fee2e2;
            color: #dc2626;
          }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default Profile;
