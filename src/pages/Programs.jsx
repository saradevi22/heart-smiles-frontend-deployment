import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPrograms, createProgram, deleteProgram, deleteProgramById } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Programs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetchPrograms();
      // Backend returns { programs: [...], pagination: {...} } or just array
      const allPrograms = response.data?.programs || response.data || [];
      // Filter out inactive programs
      const activePrograms = allPrograms.filter(p => p.isActive !== false);
      setPrograms(activePrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createProgram(formData);
      setSuccess('Program created successfully!');
      setShowForm(false);
      setFormData({
        name: '',
        description: ''
      });
      await loadPrograms();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating program:', error);
      console.error('Error response:', error?.response?.data);
      
      // Handle different error response formats
      let errorMessage = 'Failed to create program';
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
      
      setError(errorMessage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteProgram = async (programName, programId) => {
    if (!window.confirm(`Are you sure you want to delete "${programName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      // Delete by ID if available, otherwise try by name
      if (programId) {
        await deleteProgramById(programId);
      } else {
        await deleteProgram(programName);
      }
      setSuccess(`Program "${programName}" deleted successfully!`);
      await loadPrograms();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete program');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Programs...</h2>
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
        <h1>Programs</h1>
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
            {showForm ? 'Cancel' : 'Add Program'}
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

      {/* Add Program Form */}
      {showForm && user?.role === 'heartSmiles' && (
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Add New Program</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Program Name *
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
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
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
                Create Program
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

      {/* Programs List */}
      <div style={{
        background: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {programs.length > 0 ? (
          <div>
            <div style={{
              background: '#f8f9fa',
              padding: '15px 20px',
              borderBottom: '1px solid #e1e5e9',
              fontWeight: '600',
              color: '#333'
            }}>
              {programs.length} Program{programs.length !== 1 ? 's' : ''}
            </div>
            {programs.map((program, index) => (
              <div
                key={program.id || index}
                style={{
                  padding: '20px',
                  borderBottom: index < programs.length - 1 ? '1px solid #f0f0f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    {program.name}
                  </h4>
                  {program.description && (
                    <p style={{ 
                      margin: '0 0 10px 0', 
                      color: '#666', 
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {program.description}
                    </p>
                  )}
                  <div style={{ fontSize: '12px', color: '#007bff', marginTop: '5px' }}>
                    {program.participants?.length || 0} participant{(program.participants?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => navigate(`/programs/${encodeURIComponent(program.name)}`)}
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
                        onClick={() => navigate(`/programs/${encodeURIComponent(program.name)}/edit`)}
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
                        onClick={() => handleDeleteProgram(program.name, program.id)}
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
            <h3>No programs yet</h3>
            <p>Start by adding your first program using the "Add Program" button above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Programs;
