import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000', // Black background
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      color: '#FF4444' // Red text
    }}>
      <div style={{
        maxWidth: '800px',
        textAlign: 'center',
        background: 'rgba(20, 20, 20, 0.8)', // Darker container background
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '60px 40px',
        boxShadow: '0 8px 32px rgba(255, 0, 0, 0.1)', // Subtle red glow
        border: '1px solid rgba(255, 68, 68, 0.2)' // Subtle red border
      }}>
        <img
          src="/favicon.ico"
          alt="HeartSmiles Logo"
          style={{
            height: '100px',
            marginBottom: '30px',
            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))'
          }}
        />

        <h1 style={{
          fontSize: '48px',
          margin: '0 0 20px 0',
          fontWeight: '700',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          color: '#FF4444'
        }}>
          HeartSmiles Youth Success App
        </h1>

        <p style={{
          fontSize: '20px',
          lineHeight: '1.6',
          margin: '0 0 40px 0',
          opacity: 0.9,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          color: '#EDEDED' // Slightly off-white for body text readability
        }}>
          A comprehensive platform for tracking youth participation and history in HeartSmiles programs.
          Manage participant data, monitor program engagement, and export information for reporting and analysis.
        </p>

        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            to="/login"
            style={{
              background: '#FF4444', // Red button
              color: 'white',
              padding: '15px 40px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(255, 68, 68, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 68, 68, 0.3)';
            }}
          >
            Sign In
          </Link>

          <Link
            to="/register"
            style={{
              background: 'transparent',
              color: '#FF4444',
              padding: '15px 40px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: '600',
              border: '2px solid #FF4444',
              transition: 'background 0.2s, transform 0.2s',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 68, 68, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Sign Up
          </Link>
        </div>

        <div style={{
          marginTop: '60px',
          padding: '30px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          fontSize: '16px',
          lineHeight: '1.8',
          border: '1px solid rgba(255, 68, 68, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '24px', color: '#FF4444' }}>Key Features</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            textAlign: 'left'
          }}>
            <div>
              <strong style={{ color: '#FF8888' }}>📊 Participant Management</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8, color: '#CCCCCC' }}>
                Track and manage youth participants across all programs
              </p>
            </div>
            <div>
              <strong style={{ color: '#FF8888' }}>📚 Program Tracking</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8, color: '#CCCCCC' }}>
                Monitor program engagement and participant enrollment
              </p>
            </div>
            <div>
              <strong style={{ color: '#FF8888' }}>📥 Data Import</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8, color: '#CCCCCC' }}>
                Import existing data from Excel and CSV files
              </p>
            </div>
            <div>
              <strong style={{ color: '#FF8888' }}>📤 Data Export</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8, color: '#CCCCCC' }}>
                Export data in CSV format for Qualtrics and reporting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

