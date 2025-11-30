import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHeartSmiles = user?.role === 'heartSmiles';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <nav style={{ 
        width: 240, 
        background: 'white',
        borderRight: '1px solid #e1e5e9',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e1e5e9' }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
            HeartSmiles
          </h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
            Youth Success App
          </p>
        </div>
        
        <div style={{ flex: 1, padding: '10px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <Link 
                to="/" 
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/participants"
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                👥 Participants
              </Link>
            </li>
            <li>
              <Link 
                to="/programs"
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                📚 Programs
              </Link>
            </li>
            <li>
              <Link 
                to="/staff"
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                👤 Staff
              </Link>
            </li>
            {isHeartSmiles && (
              <li>
                <Link 
                  to="/import"
                  style={{
                    display: 'block',
                    padding: '12px 20px',
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  📥 Import Data
                </Link>
              </li>
            )}
            <li>
              <Link 
                to="/export"
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                📤 Export Data
              </Link>
            </li>
          </ul>
        </div>

        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid #e1e5e9',
          background: '#f8f9fa'
        }}>
          <div style={{ marginBottom: '10px', fontSize: '13px', color: '#666' }}>
            <div style={{ fontWeight: '500', color: '#333' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>
              {isHeartSmiles ? 'HeartSmiles Staff' : 'UMD Staff'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      
      <main style={{ 
        flex: 1, 
        padding: 0,
        overflow: 'auto'
      }}>
        <Outlet />
      </main>
    </div>
  );
}
