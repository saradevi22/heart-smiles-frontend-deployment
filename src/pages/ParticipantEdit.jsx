import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchParticipantById, addParticipantNote, deleteParticipantNote, uploadImage, addParticipantPhoto, deleteParticipantPhoto, fetchPrograms, addParticipantToProgram, removeParticipantFromProgram } from '../services/api';

const ParticipantEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageType, setImageType] = useState('headshot'); // 'headshot' or 'program'
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoActivity, setPhotoActivity] = useState('');
  const [photoDate, setPhotoDate] = useState('');

  // Note state
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [noteDate, setNoteDate] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Program state
  const [allPrograms, setAllPrograms] = useState([]);
  const [programSearchTerm, setProgramSearchTerm] = useState('');
  const [addProgramId, setAddProgramId] = useState('');



  const loadAllPrograms = React.useCallback(async () => {
    try {
      const resp = await fetchPrograms();
      const allPrograms = resp.data?.programs || resp.data || [];
      // Filter out inactive programs
      const activePrograms = allPrograms.filter(p => p.isActive !== false);
      setAllPrograms(activePrograms);
    } catch (err) {
      // not fatal
    }
  }, []);

  const loadParticipant = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchParticipantById(id);
      setParticipant(response.data.participant);
    } catch (err) {
      console.error('Error loading participant:', err);
      setError(err?.response?.data?.error || 'Failed to load participant');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user?.role !== 'heartSmiles') {
      navigate('/participants');
      return;
    }
    loadParticipant();
    loadAllPrograms();
  }, [id, user, navigate, loadParticipant, loadAllPrograms]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');
      setSuccess('');

      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', imageType);
      formData.append('folder', 'heart-smiles/participants');

      const uploadResponse = await uploadImage(formData);
      const imageData = uploadResponse.data.image;

      // Add photo to participant
      if (imageType === 'headshot') {
        // Update headshot
        await addParticipantPhoto(id, {
          type: 'headshot',
          imageData
        });
        setSuccess('Profile photo uploaded successfully!');
      } else {
        // Add to uploaded photos
        await addParticipantPhoto(id, {
          type: 'program',
          imageData,
          caption: photoCaption,
          activity: photoActivity,
          uploadedAt: photoDate || undefined
        });
        setSuccess('Photo uploaded successfully!');
        // Reset form fields
        setPhotoCaption('');
        setPhotoActivity('');
        setPhotoDate('');
      }

      // Reload participant data
      await loadParticipant();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err?.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      setError('Note content is required');
      return;
    }

    try {
      setAddingNote(true);
      setError('');
      setSuccess('');

      await addParticipantNote(id, {
        content: noteContent,
        type: noteType,
        createdAt: noteDate || undefined
      });

      setSuccess('Note added successfully!');
      setNoteContent('');
      setNoteType('general');
      setNoteDate('');

      // Reload participant data
      await loadParticipant();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err?.response?.data?.error || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Participant...</h2>
      </div>
    );
  }

  if (error && !participant) {
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
          onClick={() => navigate('/participants')}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Back to Participants
        </button>
      </div>
    );
  }

  if (!participant) return null;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 5px 0' }}>Edit Participant: {participant.name}</h1>
        <button
          onClick={() => navigate(`/participants/${id}`)}
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
          ← Back to Participant Details
        </button>
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {/* Upload Images Section */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
            Upload Images
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Image Type
            </label>
            <select
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="headshot">Profile Photo (Headshot)</option>
              <option value="program">Program Photo</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Select Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
              Maximum file size: 10MB. Supported formats: JPG, PNG, GIF
            </p>
          </div>

          {imageType === 'program' && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="e.g., 'Participant at summer camp'"
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
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Activity (optional)
                </label>
                <input
                  type="text"
                  value={photoActivity}
                  onChange={(e) => setPhotoActivity(e.target.value)}
                  placeholder="e.g., 'Mentorship Session'"
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
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Photo Date (optional, defaults to today)
                </label>
                <input
                  type="date"
                  value={photoDate}
                  onChange={(e) => setPhotoDate(e.target.value)}
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
            </>
          )}

          {uploadingImage && (
            <div style={{
              background: '#e7f3ff',
              padding: '10px',
              borderRadius: '4px',
              textAlign: 'center',
              color: '#0066cc'
            }}>
              Uploading image...
            </div>
          )}

          {/* Current Profile Photo */}
          {participant.headshotPictureUrl && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e1e5e9' }}>
              <strong style={{ fontSize: '13px', color: '#666' }}>Current Profile Photo:</strong>
              <img
                src={participant.headshotPictureUrl?.url || participant.headshotPictureUrl}
                alt="Current profile"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  marginTop: '10px',
                  borderRadius: '6px',
                  border: '1px solid #e1e5e9'
                }}
              />
            </div>
          )}

          {/* Uploaded Photos with Delete */}
          {participant.uploadedPhotos && participant.uploadedPhotos.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e1e5e9' }}>
              <strong style={{ fontSize: '13px', color: '#666' }}>Uploaded Photos ({participant.uploadedPhotos.length}):</strong>
              <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                {participant.uploadedPhotos.map((photo, index) => (
                  <div key={photo.id || index} style={{ position: 'relative' }}>
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Photo'}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #e1e5e9'
                      }}
                    />
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this photo?')) {
                          try {
                            await deleteParticipantPhoto(id, photo.id);
                            setSuccess('Photo deleted successfully!');
                            await loadParticipant();
                            setTimeout(() => setSuccess(''), 3000);
                          } catch (err) {
                            setError(err?.response?.data?.error || 'Failed to delete photo');
                          }
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(220, 53, 69, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete photo"
                    >
                      ×
                    </button>
                    {photo.caption && (
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Notes Section */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
            Add Note
          </h3>

          <form onSubmit={handleAddNote}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Note Type
              </label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="general">General</option>
                <option value="session">Session</option>
                <option value="milestone">Milestone</option>
                <option value="concern">Concern</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Note Date (optional, defaults to today)
              </label>
              <input
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  marginBottom: '15px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Note Content *
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows="6"
                required
                placeholder="Enter your note here..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={addingNote || !noteContent.trim()}
              style={{
                width: '100%',
                background: addingNote ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: addingNote || !noteContent.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: addingNote || !noteContent.trim() ? 0.6 : 1
              }}
            >
              {addingNote ? 'Adding Note...' : 'Add Note'}
            </button>
          </form>

          {/* Recent Notes Preview with Delete */}
          {participant.notes && participant.notes.length > 0 && (
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e1e5e9' }}>
              <strong style={{ fontSize: '13px', color: '#666' }}>Recent Notes ({participant.notes.length}):</strong>
              <div style={{ marginTop: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {participant.notes.slice().reverse().map((note, index) => (
                  <div
                    key={note.id || index}
                    style={{
                      background: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      fontSize: '12px',
                      position: 'relative'
                    }}
                  >
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this note?')) {
                          try {
                            await deleteParticipantNote(id, note.id);
                            setSuccess('Note deleted successfully!');
                            await loadParticipant();
                            setTimeout(() => setSuccess(''), 3000);
                          } catch (err) {
                            setError(err?.response?.data?.error || 'Failed to delete note');
                          }
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Delete
                    </button>
                    <div style={{ fontWeight: '500', color: '#333', marginBottom: '3px' }}>
                      {note.author || 'Staff'} • {note.type || 'general'}
                    </div>
                    <div style={{ color: '#666', marginBottom: '3px' }}>{note.content}</div>
                    {note.createdAt && (
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {(() => {
                          try {
                            // Handle Firestore Timestamp format
                            if (note.createdAt && typeof note.createdAt === 'object') {
                              if (note.createdAt.seconds) {
                                return new Date(note.createdAt.seconds * 1000).toLocaleDateString();
                              } else if (note.createdAt.toDate) {
                                return note.createdAt.toDate().toLocaleDateString();
                              } else if (note.createdAt._seconds) {
                                return new Date(note.createdAt._seconds * 1000).toLocaleDateString();
                              }
                            }
                            // Handle Date object or ISO string
                            const date = new Date(note.createdAt);
                            if (!isNaN(date.getTime())) {
                              return date.toLocaleDateString();
                            }
                            return 'Invalid Date';
                          } catch (e) {
                            console.error('Error formatting note date:', e, note.createdAt);
                            return 'Invalid Date';
                          }
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Programs Section */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
            Programs ({participant.programDetails?.length || participant.programs?.length || 0})
          </h3>

          {(participant.programDetails?.length > 0 || participant.programs?.length > 0) && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {(participant.programDetails || []).map((program, index) => (
                  <div
                    key={program.id || index}
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
                      <div style={{ fontWeight: '500', color: '#333' }}>{program.name}</div>
                      {program.description && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
                          {program.description.length > 100
                            ? `${program.description.substring(0, 100)}...`
                            : program.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to remove this participant from "${program.name}"?`)) {
                          try {
                            setError('');
                            await removeParticipantFromProgram(id, program.id);
                            setSuccess('Participant removed from program successfully!');
                            await loadParticipant();
                            setTimeout(() => setSuccess(''), 3000);
                          } catch (err) {
                            setError(err?.response?.data?.error || 'Failed to remove participant from program');
                          }
                        }
                      }}
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
              Add Program
            </h4>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!addProgramId) return;
              try {
                setError('');
                await addParticipantToProgram(id, addProgramId);
                setSuccess('Participant added to program successfully!');
                setAddProgramId('');
                setProgramSearchTerm('');
                await loadParticipant();
                setTimeout(() => setSuccess(''), 3000);
              } catch (err) {
                setError(err?.response?.data?.error || 'Failed to add participant to program');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                  Search Programs
                </label>
                <input
                  type="text"
                  value={programSearchTerm}
                  onChange={(e) => {
                    setProgramSearchTerm(e.target.value);
                    // Reset selected program if it's no longer in filtered list
                    const participantProgramIds = (participant.programDetails || []).map(p => p.id).concat(participant.programs || []);
                    const filteredPrograms = allPrograms.filter(program => {
                      const isNotInParticipant = !participantProgramIds.includes(program.id);
                      const searchTerm = e.target.value.toLowerCase();
                      const matchesSearch = !searchTerm ||
                        program.name.toLowerCase().includes(searchTerm) ||
                        program.description?.toLowerCase().includes(searchTerm);
                      return isNotInParticipant && matchesSearch;
                    });
                    if (addProgramId && !filteredPrograms.find(p => p.id === addProgramId)) {
                      setAddProgramId('');
                    }
                  }}
                  placeholder="Search by program name or description..."
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
                const participantProgramIds = (participant.programDetails || []).map(p => p.id).concat(participant.programs || []);
                const searchLower = programSearchTerm.toLowerCase().trim();
                const filteredPrograms = allPrograms.filter(program => {
                  // Only show active programs
                  if (program.isActive === false) return false;
                  // Exclude programs already assigned to participant
                  const isNotInParticipant = !participantProgramIds.includes(program.id);
                  if (!isNotInParticipant) return false;
                  // Match search term if provided
                  if (searchLower) {
                    const nameMatch = program.name?.toLowerCase().includes(searchLower);
                    const descMatch = program.description?.toLowerCase().includes(searchLower);
                    return nameMatch || descMatch;
                  }
                  return true;
                });

                if (filteredPrograms.length > 0) {
                  return (
                    <select
                      key={`program-select-${programSearchTerm}-${filteredPrograms.length}`}
                      value={addProgramId}
                      onChange={e => setAddProgramId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Select a program...</option>
                      {filteredPrograms.map(program => (
                        <option key={program.id} value={program.id}>
                          {program.name} {program.description && `- ${program.description.substring(0, 50)}${program.description.length > 50 ? '...' : ''}`}
                        </option>
                      ))}
                    </select>
                  );
                } else {
                  return (
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '4px', color: '#666', fontSize: '14px' }}>
                      {programSearchTerm ? 'No programs found matching your search.' : 'All programs are already assigned to this participant.'}
                    </div>
                  );
                }
              })()}
              <button
                type="submit"
                disabled={!addProgramId}
                style={{
                  background: addProgramId ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: addProgramId ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: addProgramId ? 1 : 0.6
                }}
              >
                Add Program
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantEdit;

