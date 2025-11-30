import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser } from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check if redirected due to token expiration or invalidation
    if (searchParams.get('expired') === 'true') {
      setError('Your session has expired. Please log in again.');
    } else if (searchParams.get('invalid') === 'true') {
      setError('Your session is invalid. Please log in again.');
    }
  }, [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await loginUser(email, password);
      console.log('Login response:', response);
      login({ token: response.data.token, user: response.data.staff });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Error response:', err?.response?.data);
      console.error('Error status:', err?.response?.status);
      // Get the actual base URL being used by the API
      const actualBaseURL = api.defaults.baseURL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
      console.error('API Base URL:', actualBaseURL);
      
      // Handle different error response formats
      let errorMessage = 'Login failed';
      
      // Check if it's a network error (no response)
      if (!err.response) {
        // Check error code to determine type of network error
        if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://localhost:5001. Check the browser console for more details.';
        } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
          errorMessage = `Network error: Cannot reach the server at ${actualBaseURL}. Please check if the backend server is running.`;
        } else if (err.code === 'ERR_CORS') {
          errorMessage = 'CORS error: The server is not allowing requests from this origin. Please check CORS configuration.';
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = `Network error: ${err.code || err.message || 'Unable to connect to server. Please check if the backend server is running on http://localhost:5001'}`;
        }
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else if (err.response?.data) {
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.map(e => e.msg || e.message || e).join(', ');
        } else {
          errorMessage = `Server error (${err.response.status}): ${err.response.statusText || 'Login failed'}`;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '28px' }}>Sign In</h2>
        <p style={{ margin: '0 0 30px 0', color: '#666', fontSize: '14px' }}>
          Welcome back to HeartSmiles Youth Success App
        </p>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#6c757d' : '#667eea',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            <span style={{ color: '#666' }}>Don't have an account? </span>
            <a href="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
              Sign up here
            </a>
          </div>
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <a href="/landing" style={{ color: '#667eea', textDecoration: 'none', fontSize: '13px' }}>
              ← Back to home
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
