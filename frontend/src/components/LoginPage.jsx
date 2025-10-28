import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBook, FaUser, FaLock } from 'react-icons/fa';

const DUMMY_CREDENTIALS = {
  username: 'admin',
  password: 'libdesk@2025'
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/home';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (username === DUMMY_CREDENTIALS.username && password === DUMMY_CREDENTIALS.password) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        document.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { type: 'success', message: 'Logged in successfully', title: 'Success' } 
        }));
        navigate(from, { replace: true });
      } else {
        document.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { type: 'error', message: 'Invalid credentials', title: 'Login Failed' } 
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card shadow-lg" style={{ 
        width: '100%', 
        maxWidth: 440, 
        borderRadius: '20px',
        border: 'none',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            backdropFilter: 'blur(10px)'
          }}>
            <FaBook size={40} color="white" />
          </div>
          <h3 className="text-white mb-2" style={{ fontWeight: '600', fontSize: '28px' }}>LibDesk</h3>
          <p className="text-white" style={{ opacity: 0.9, fontSize: '14px', margin: 0 }}>Library Management System</p>
        </div>
        
        <div className="card-body p-4" style={{ padding: '40px 35px' }}>
          <h5 className="text-center mb-4" style={{ color: '#333', fontWeight: '600' }}>Admin Login</h5>
          <form onSubmit={handleSubmit} autoComplete="off">
            <input type="text" style={{ display: 'none' }} />
            <input type="password" style={{ display: 'none' }} />
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: '500', color: '#555', fontSize: '14px' }}>Username</label>
              <div className="input-group">
                <span className="input-group-text" style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  borderRight: 'none'
                }}>
                  <FaUser color="#667eea" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  style={{
                    borderLeft: 'none',
                    padding: '12px',
                    fontSize: '15px'
                  }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="Enter your username"
                  name="username-field"
                  data-form-type="other"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label" style={{ fontWeight: '500', color: '#555', fontSize: '14px' }}>Password</label>
              <div className="input-group">
                <span className="input-group-text" style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  borderRight: 'none'
                }}>
                  <FaLock color="#667eea" />
                </span>
                <input
                  type="password"
                  className="form-control"
                  style={{
                    borderLeft: 'none',
                    padding: '12px',
                    fontSize: '15px'
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  name="password-field"
                  data-form-type="other"
                />
              </div>
            </div>
            <button 
              className="btn w-100" 
              type="submit" 
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                borderRadius: '8px',
                transition: 'transform 0.2s',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


