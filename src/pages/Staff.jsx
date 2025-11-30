import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchStaff, deleteStaff } from '../services/api';

const Staff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await fetchStaff();
      setStaff(response.data?.staff || response.data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to deactivate ${staffName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteStaff(staffId);
      setSuccess(`Staff member ${staffName} has been deactivated successfully!`);
      await loadStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to deactivate staff member');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Staff...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Staff Directory</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        View all staff members with their roles and contact information.
      </p>

      {success && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '12px 20px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          ✅ {success}
        </div>
      )}
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px 20px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {error}
        </div>
      )}

      <div style={{
        background: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {staff.length > 0 ? (
          <div>
            <div style={{
              background: '#f8f9fa',
              padding: '15px 20px',
              borderBottom: '1px solid #e1e5e9',
              fontWeight: '600',
              color: '#333'
            }}>
              {staff.length} Staff Member{staff.length !== 1 ? 's' : ''}
            </div>
            {staff.map((member, index) => (
              <div
                key={member.id || index}
                style={{
                  padding: '20px',
                  borderBottom: index < staff.length - 1 ? '1px solid #f0f0f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                    {member.name}
                  </h4>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    <strong>Email:</strong> {member.email}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    <strong>Username:</strong> {member.username}
                    {member.phoneNumber && ` • Phone: ${member.phoneNumber}`}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: member.role === 'heartSmiles' ? '#007bff' : '#28a745',
                    marginTop: '5px',
                    fontWeight: '500'
                  }}>
                    {member.role === 'heartSmiles' ? 'HeartSmiles Staff' : 'University of Maryland Staff'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    padding: '8px 12px',
                    background: member.isActive ? '#d4edda' : '#f8d7da',
                    color: member.isActive ? '#155724' : '#721c24',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </div>
                  {user?.role === 'heartSmiles' && member.id !== user.id && (
                    <button
                      onClick={() => handleDeleteStaff(member.id, member.name)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <h3>No staff members found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Staff;
