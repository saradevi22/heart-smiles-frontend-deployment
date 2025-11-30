import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('heartSmiles');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { name, username, email, password, role };
      console.log('Sending registration payload:', payload);
      const response = await registerUser(payload);
      console.log('Registration response:', response);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err?.response?.data);
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Registration failed');
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
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '28px' }}>Create Staff Account</h2>
        <p style={{ margin: '0 0 30px 0', color: '#666', fontSize: '14px' }}>
          Register a new staff account for HeartSmiles Youth Success App
        </p>
        <form onSubmit={onSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Full name"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                Username *
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Username"
              />
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="your.email@example.com"
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="At least 8 chars, 1 uppercase, 1 number"
            />
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
              Password must contain at least one lowercase letter, one uppercase letter, and one number
            </p>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                background: 'white'
              }}
            >
              <option value="heartSmiles">HeartSmiles Staff</option>
              <option value="umd">University of Maryland Staff</option>
            </select>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            <span style={{ color: '#666' }}>Already have an account? </span>
            <a href="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
              Sign in here
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
