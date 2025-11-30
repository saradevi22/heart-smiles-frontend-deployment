import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchParticipants, fetchPrograms } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalPrograms: 0,
    recentParticipants: [],
    recentPrograms: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [participantsRes, programsRes] = await Promise.all([
        fetchParticipants(),
        fetchPrograms()
      ]);

      // Backend returns { participants: [...], pagination: {...} } or just array
      const participants = participantsRes.data?.participants || participantsRes.data || [];
      // Backend returns { programs: [...], pagination: {...} } or just array
      const programs = programsRes.data?.programs || programsRes.data || [];

      setStats({
        totalParticipants: participants.length,
        totalPrograms: programs.length,
        recentParticipants: participants.slice(0, 5),
        recentPrograms: programs.slice(0, 5)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || 'User'}!</p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Role: {user?.role === 'heartSmiles' ? 'HeartSmiles Staff' : 'University of Maryland Staff'}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{stats.totalParticipants}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Total Participants</p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{stats.totalPrograms}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Active Programs</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Recent Participants */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Recent Participants</h3>
          {stats.recentParticipants.length > 0 ? (
            <div>
              {stats.recentParticipants.map((participant, index) => (
                <div key={participant.id || index} style={{
                  padding: '10px 0',
                  borderBottom: index < stats.recentParticipants.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <div style={{ fontWeight: '500', color: '#333' }}>
                    {participant.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {participant.programs?.length || 0} program(s)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No participants yet</p>
          )}
        </div>

        {/* Recent Programs */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Recent Programs</h3>
          {stats.recentPrograms.length > 0 ? (
            <div>
              {stats.recentPrograms.map((program, index) => (
                <div key={program.id || index} style={{
                  padding: '10px 0',
                  borderBottom: index < stats.recentPrograms.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <div style={{ fontWeight: '500', color: '#333' }}>
                    {program.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {program.participants?.length || 0} participant(s)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No programs yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.location.href = '/participants'}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            View All Participants
          </button>
          <button 
            onClick={() => window.location.href = '/programs'}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            View All Programs
          </button>
          {user?.role === 'heartSmiles' && (
            <>
              <button 
                onClick={() => window.location.href = '/import'}
                style={{
                  background: '#ffc107',
                  color: '#333',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Import Data
              </button>
              <button 
                onClick={() => window.location.href = '/export'}
                style={{
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Export Data
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
