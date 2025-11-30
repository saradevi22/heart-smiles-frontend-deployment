import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchParticipants, createParticipant, deleteParticipant } from '../services/api';
// Create functional components; API functions for getting data and creating new participants

const Participants = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    address: '',
    school: '',
    identificationNumber: '',
    programs: []
  });
  // Details for creating a new participant 

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      // Only fetch active participants
      const response = await fetchParticipants();
      // Backend returns { participants: [...], pagination: {...} }
      const allParticipants = response.data?.participants || response.data || [];
      // Filter out inactive participants
      const activeParticipants = allParticipants.filter(p => p.isActive !== false);
      setParticipants(activeParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };
  // Load each participant 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createParticipant(formData);
      setSuccess('Participant created successfully!');
      setShowForm(false);
      setFormData({
        name: '',
        dateOfBirth: '',
        address: '',
        school: '',
        identificationNumber: '',
        programs: []
      });
      await loadParticipants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating participant:', error);
      console.error('Error response:', error?.response?.data);
      
      // Handle different error response formats
      let errorMessage = 'Failed to create participant';
      if (error?.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map(e => e.msg || e.message || e).join(', ');
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Handle token expiration specifically
      if (errorMessage.includes('expired') || errorMessage.includes('Token expired')) {
        setError('Your session has expired. You will be redirected to login.');
        // The API interceptor will handle the redirect
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteParticipant = async (participantId, participantName) => {
    if (!window.confirm(`Are you sure you want to delete ${participantName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteParticipant(participantId);
      setSuccess(`Participant ${participantName} deleted successfully!`);
      await loadParticipants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete participant');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Participants...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <h1>Participants</h1>
        {user?.role === 'heartSmiles' && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showForm ? 'Cancel' : 'Add Participant'}
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
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

      {/* Add Participant Form */}
      {showForm && user?.role === 'heartSmiles' && (
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Add New Participant</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  School
                </label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  ID Number *
                </label>
                <input
                  type="text"
                  name="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Create Participant
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Participants List */}
      <div style={{
        background: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {participants.length > 0 ? (
          <div>
            <div style={{
              background: '#f8f9fa',
              padding: '15px 20px',
              borderBottom: '1px solid #e1e5e9',
              fontWeight: '600',
              color: '#333'
            }}>
              {participants.length} Participant{participants.length !== 1 ? 's' : ''}
            </div>
            {participants.map((participant, index) => (
              <div
                key={participant.id || index}
                style={{
                  padding: '20px',
                  borderBottom: index < participants.length - 1 ? '1px solid #f0f0f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                    {participant.name}
                  </h4>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    {participant.dateOfBirth && `Born: ${new Date(participant.dateOfBirth).toLocaleDateString()}`}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {participant.school && `School: ${participant.school}`}
                    {participant.identificationNumber && ` • ID: ${participant.identificationNumber}`}
                  </div>
                  {participant.programs && participant.programs.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#007bff', marginTop: '5px' }}>
                      {participant.programs.length} program{participant.programs.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => navigate(`/participants/${participant.id}`)}
                    style={{
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      padding: '5px 15px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    View
                  </button>
                  {user?.role === 'heartSmiles' && (
                    <>
                      <button
                        onClick={() => navigate(`/participants/${participant.id}/edit`)}
                        style={{
                          background: '#ffc107',
                          color: '#333',
                          border: 'none',
                          padding: '5px 15px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteParticipant(participant.id, participant.name)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '5px 15px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <h3>No participants yet</h3>
            <p>Start by adding your first participant using the "Add Participant" button above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Participants;
