import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchProgramByName,
  fetchParticipants,
  addParticipant,
  removeParticipant,
} from '../services/api';

const ProgramsDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allParticipants, setAllParticipants] = useState([]);
  const [addParticipantId, setAddParticipantId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProgram();
    loadAllParticipants();
    // eslint-disable-next-line
  }, [name]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await fetchProgramByName(name);
      setProgram(resp.data.program);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const loadAllParticipants = async () => {
    try {
      const resp = await fetchParticipants();
      const allParticipants = resp.data?.participants || resp.data || [];
      // Filter out inactive participants
      const activeParticipants = allParticipants.filter(p => p.isActive !== false);
      setAllParticipants(activeParticipants);
    } catch (err) {
      // don't block for this
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!addParticipantId) return;
    try {
      setError('');
      await addParticipant(name, { participantId: addParticipantId });
      setSuccess('Participant added!');
      setAddParticipantId('');
      setSearchTerm('');
      await loadProgram();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to add participant');
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!window.confirm('Are you sure you want to remove this participant from the program?')) return;
    try {
      setError('');
      await removeParticipant(name, participantId);
      setSuccess('Participant removed!');
      await loadProgram();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to remove participant');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Program...</h2>
      </div>
    );
  }

  if (error && !program) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px 20px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error || 'Program not found'}
        </div>
        <button
          onClick={() => navigate('/programs')}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Back to Programs
        </button>
      </div>
    );
  }

  if (!program) return null;

  // Use participantDetails from backend if available, otherwise use participants array
  const participantDetails = program.participantDetails || [];
  const participantIds = program.participants || [];

  // Filter participants based on search term
  const searchLower = searchTerm.toLowerCase().trim();
  const filteredParticipants = allParticipants.filter(ap => {
    // Only show active participants
    if (ap.isActive === false) return false;
    // Exclude participants already in program
    const isNotInProgram = !participantIds.includes(ap.id);
    if (!isNotInProgram) return false;
    // Match search term if provided
    if (searchLower) {
      const nameMatch = ap.name?.toLowerCase().includes(searchLower);
      const idMatch = ap.identificationNumber?.toLowerCase().includes(searchLower);
      const schoolMatch = ap.school?.toLowerCase().includes(searchLower);
      return nameMatch || idMatch || schoolMatch;
    }
    return true;
  });

  return (
    <div style={{ padding: '20px' }}>
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

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>{program.name}</h1>
          <button
            onClick={() => navigate('/programs')}
            style={{
              background: 'transparent',
              color: '#667eea',
              border: 'none',
              padding: '5px 0',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            ← Back to Programs
          </button>
        </div>
        {user?.role === 'heartSmiles' && (
          <button
            onClick={() => navigate(`/programs/${encodeURIComponent(name)}/edit`)}
            style={{
              background: '#ffc107',
              color: '#333',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Edit Program
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Basic Information */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            color: '#333',
            borderBottom: '2px solid #667eea',
            paddingBottom: '10px'
          }}>
            Basic Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <strong style={{ color: '#666', fontSize: '13px' }}>Name:</strong>
              <div style={{ marginTop: '3px', color: '#333' }}>{program.name}</div>
            </div>
            {program.description && (
              <div>
                <strong style={{ color: '#666', fontSize: '13px' }}>Description:</strong>
                <div style={{ marginTop: '3px', color: '#333', whiteSpace: 'pre-wrap' }}>{program.description}</div>
              </div>
            )}
            {program.location && (
              <div>
                <strong style={{ color: '#666', fontSize: '13px' }}>Location:</strong>
                <div style={{ marginTop: '3px', color: '#333' }}>{program.location}</div>
              </div>
            )}
            {program.startDate && (
              <div>
                <strong style={{ color: '#666', fontSize: '13px' }}>Start Date:</strong>
                <div style={{ marginTop: '3px', color: '#333' }}>
                  {program.startDate.seconds 
                    ? new Date(program.startDate.seconds * 1000).toLocaleDateString()
                    : new Date(program.startDate).toLocaleDateString()}
                </div>
              </div>
            )}
            {program.endDate && (
              <div>
                <strong style={{ color: '#666', fontSize: '13px' }}>End Date:</strong>
                <div style={{ marginTop: '3px', color: '#333' }}>
                  {program.endDate.seconds 
                    ? new Date(program.endDate.seconds * 1000).toLocaleDateString()
                    : new Date(program.endDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participants */}
      <div style={{
        background: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h3 style={{
          margin: '0 0 15px 0',
          color: '#333',
          borderBottom: '2px solid #667eea',
          paddingBottom: '10px'
        }}>
          Participants ({participantDetails.length})
        </h3>
        {participantDetails.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            {participantDetails.map((participant, index) => (
              <div
                key={participant.id || index}
                style={{
                  background: '#f8f9fa',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  border: '1px solid #e1e5e9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  flex: '1 1 250px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: '#333' }}>
                    {participant.name}
                  </div>
                  {participant.school && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
                      {participant.school}
                    </div>
                  )}
                </div>
                {user?.role === 'heartSmiles' && (
                  <button
                    onClick={() => handleRemoveParticipant(participant.id)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px', marginBottom: '20px' }}>
            No participants yet.
          </div>
        )}

        {user?.role === 'heartSmiles' && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e1e5e9' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>
              Add Participant
            </h4>
            <form onSubmit={handleAddParticipant} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                  Search Participants
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Reset selected participant if it's no longer in filtered list
                    const filtered = allParticipants.filter(ap => {
                      const isNotInProgram = !participantIds.includes(ap.id);
                      const searchValue = e.target.value.toLowerCase();
                      const matchesSearch = !searchValue || 
                        ap.name.toLowerCase().includes(searchValue) ||
                        ap.identificationNumber?.toLowerCase().includes(searchValue) ||
                        ap.school?.toLowerCase().includes(searchValue);
                      return isNotInProgram && matchesSearch;
                    });
                    if (addParticipantId && !filtered.find(p => p.id === addParticipantId)) {
                      setAddParticipantId('');
                    }
                  }}
                  placeholder="Search by name, ID number, or school..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {filteredParticipants.length > 0 ? (
                <select
                  key={`participant-select-${searchTerm}-${filteredParticipants.length}`}
                  value={addParticipantId}
                  onChange={e => setAddParticipantId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select a participant...</option>
                  {filteredParticipants.map(ap => (
                    <option key={ap.id} value={ap.id}>
                      {ap.name} {ap.identificationNumber && `(${ap.identificationNumber})`} {ap.school && `- ${ap.school}`}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '4px', color: '#666', fontSize: '14px' }}>
                  {searchTerm ? 'No participants found matching your search.' : 'All participants are already in this program.'}
                </div>
              )}
              <button
                type="submit"
                disabled={!addParticipantId}
                style={{
                  background: addParticipantId ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: addParticipantId ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: addParticipantId ? 1 : 0.6
                }}
              >
                Add Participant
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsDetail;