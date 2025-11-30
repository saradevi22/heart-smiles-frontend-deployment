import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { importParticipantsFile } from '../services/api';

const Import = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [importType, setImportType] = useState('participants');
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Only HeartSmiles staff can access import functionality
  if (user?.role !== 'heartSmiles') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>Only HeartSmiles staff can access import functionality.</p>
      </div>
    );
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/csv',
        'text/plain'
      ];
      
      const allowedExtensions = ['.xls', '.xlsx', '.csv'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setError('Please select a valid Excel (.xls, .xlsx) or CSV file.');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const response = await importParticipantsFile(selectedFile, dryRun);
      setResult(response.data);
      
      if (!dryRun) {
        // If not a dry run, clear the file selection
        setSelectedFile(null);
        document.getElementById('fileInput').value = '';
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err?.response?.data?.error || 'Import failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Import Data</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Upload Excel or CSV files to import participant and program data. Use dry run mode to preview changes before importing.
      </p>

      <div style={{
        background: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>Import Settings</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Import Type
          </label>
          <select
            value={importType}
            onChange={(e) => setImportType(e.target.value)}
            style={{
              width: '200px',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="participants">Participants</option>
            <option value="programs">Programs</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
            />
            <span>Dry Run Mode (Preview changes without importing)</span>
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Select File
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleFileSelect}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
            Supported formats: Excel (.xls, .xlsx) and CSV files
          </p>
        </div>

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!selectedFile || loading}
          style={{
            background: dryRun ? '#ffc107' : '#28a745',
            color: dryRun ? '#333' : 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '5px',
            cursor: selectedFile && !loading ? 'pointer' : 'not-allowed',
            opacity: selectedFile && !loading ? 1 : 0.6
          }}
        >
          {loading ? 'Processing...' : dryRun ? 'Preview Import' : 'Import Data'}
        </button>
      </div>

      {/* Import Results */}
      {result && (
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>
            {dryRun ? 'Preview Results' : 'Import Results'}
          </h3>
          
          {result.success ? (
            <div>
              <div style={{
                background: '#d4edda',
                color: '#155724',
                padding: '10px 15px',
                borderRadius: '4px',
                marginBottom: '15px',
                border: '1px solid #c3e6cb'
              }}>
                ✅ {dryRun ? 'Preview completed successfully!' : 'Import completed successfully!'}
              </div>
              
              {result.summary && (
                <div style={{ marginBottom: '15px' }}>
                  <h4>Summary:</h4>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {Object.entries(result.summary).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.data && result.data.length > 0 && (
                <div>
                  <h4>Data Preview:</h4>
                  <div style={{
                    maxHeight: '300px',
                    overflow: 'auto',
                    border: '1px solid #e1e5e9',
                    borderRadius: '4px'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                          {Object.keys(result.data[0]).map(key => (
                            <th key={key} style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              borderBottom: '1px solid #e1e5e9',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} style={{
                                padding: '8px 12px',
                                borderBottom: '1px solid #f0f0f0',
                                fontSize: '12px'
                              }}>
                                {String(value || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {result.data.length > 10 && (
                      <div style={{
                        padding: '10px',
                        textAlign: 'center',
                        color: '#666',
                        fontSize: '12px',
                        background: '#f8f9fa'
                      }}>
                        Showing first 10 rows of {result.data.length} total
                      </div>
                    )}
                  </div>
                </div>
              )}

              {dryRun && result.data && result.data.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => {
                      setDryRun(false);
                      handleImport();
                    }}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm Import
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '10px 15px',
              borderRadius: '4px',
              border: '1px solid #f5c6cb'
            }}>
              ❌ {result.error || 'Import failed'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Import;
