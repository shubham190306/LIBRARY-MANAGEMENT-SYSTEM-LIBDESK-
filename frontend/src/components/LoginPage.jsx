import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const DUMMY_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

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
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <div className="card shadow" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-3">LibDesk Admin Login</h3>
          <p className="text-muted text-center mb-4">Use the demo credentials below to sign in</p>
          <div className="alert alert-info py-2">
            <div><strong>Username:</strong> {DUMMY_CREDENTIALS.username}</div>
            <div><strong>Password:</strong> {DUMMY_CREDENTIALS.password}</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


