import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProgramByName, updateProgram, fetchParticipants, addParticipant, removeParticipant, uploadImage } from '../services/api';

const ProgramsEdit = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [allParticipants, setAllParticipants] = useState([]);
  const [programParticipants, setProgramParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addParticipantId, setAddParticipantId] = useState('');

  useEffect(() => {
    if (user?.role !== 'heartSmiles') {
      navigate('/programs');
      return;
    }
    loadProgram();
    loadAllParticipants();
    // eslint-disable-next-line
  }, [name, user]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchProgramByName(name);
      const p = response.data.program;
      setFormData({
        name: p.name || '',
        description: p.description || '',
        location: p.location || '',
        startDate: p.startDate ? (p.startDate.seconds ? new Date(p.startDate.seconds * 1000).toISOString().split('T')[0] : p.startDate.slice(0, 10)) : '',
        endDate: p.endDate ? (p.endDate.seconds ? new Date(p.endDate.seconds * 1000).toISOString().split('T')[0] : p.endDate.slice(0, 10)) : '',
      });

      // Set program participants
      if (p.participantDetails && p.participantDetails.length > 0) {
        setProgramParticipants(p.participantDetails);
      } else if (p.participants && p.participants.length > 0) {
        // If participantDetails not available, fetch them
        const participantPromises = p.participants.map(pid =>
          fetchParticipants().then(res => {
            const participants = res.data?.participants || res.data || [];
            return participants.find(p => p.id === pid);
          }).catch(() => null)
        );
        const details = await Promise.all(participantPromises);
        setProgramParticipants(details.filter(p => p !== null));
      }
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
      // not fatal
    }
  };

  const handleInputChange = (e) => {
    const { name: fieldName, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await updateProgram(name, formData);
      setSuccess('Program updated successfully!');
      setTimeout(() => {
        setSuccess('');
        navigate(`/programs/${encodeURIComponent(name)}`);
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update program');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'program');
      formData.append('folder', 'heart-smiles/programs');

      await uploadImage(formData);
      // For now, we'll just show success. Photo storage for programs can be added later.
      setSuccess('Photo uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
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

  if (error && !formData.name) {
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
          {error}
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

  return (
    <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0 }}>Edit Program</h1>
        <button
          onClick={() => navigate(`/programs/${encodeURIComponent(name)}`)}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Cancel
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {/* Program Details Form */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
            Program Details
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                  Program Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  required
                  onChange={handleInputChange}
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
              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  required
                  onChange={handleInputChange}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
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
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
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
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
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
              </div>
            </div>
            <button
              type="submit"
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: 24,
                fontSize: 16,
                fontWeight: '500'
              }}
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Photo Upload Section */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
            Program Photos
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '8px' }}>
              Upload Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
              Maximum file size: 10MB. Supported formats: JPG, PNG, GIF
            </p>
            {uploading && (
              <div style={{
                background: '#e7f3ff',
                padding: '10px',
                borderRadius: '4px',
                textAlign: 'center',
                color: '#0066cc',
                marginTop: '10px'
              }}>
                Uploading image...
              </div>
            )}
          </div>
        </div>

        {/* Participants Section */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
            Participants ({programParticipants.length})
          </h3>

          {programParticipants.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {programParticipants.map((participant, index) => (
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
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ paddingTop: '20px', borderTop: '1px solid #e1e5e9' }}>
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
                    const participantIds = programParticipants.map(p => p.id);
                    const filtered = allParticipants.filter(ap => {
                      const isNotInProgram = !participantIds.includes(ap.id);
                      const searchValue = e.target.value.toLowerCase();
                      const matchesSearch = !searchValue ||
                        ap.name.toLowerCase().includes(searchValue) ||
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
              {(() => {
                const participantIds = programParticipants.map(p => p.id);
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
                    const schoolMatch = ap.school?.toLowerCase().includes(searchLower);
                    return nameMatch || schoolMatch;
                  }
                  return true;
                });

                if (filteredParticipants.length > 0) {
                  return (
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
                          {ap.name} {ap.school && `- ${ap.school}`}
                        </option>
                      ))}
                    </select>
                  );
                } else {
                  return (
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '4px', color: '#666', fontSize: '14px' }}>
                      {searchTerm ? 'No participants found matching your search.' : 'All participants are already in this program.'}
                    </div>
                  );
                }
              })()}
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
        </div>
      </div>
    </div>
  );
};

export default ProgramsEdit;