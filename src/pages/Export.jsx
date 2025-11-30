import React, { useState, useEffect } from 'react';
import { exportParticipantsCsv, fetchParticipants } from '../services/api';
import api from '../services/api';
import jsPDF from 'jspdf';

const Export = () => {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('participants');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // PDF export state
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPdfExport, setShowPdfExport] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (showPdfExport) {
      loadParticipants();
    }
  }, [showPdfExport]);

  const loadParticipants = async () => {
    try {
      const response = await fetchParticipants();
      const participants = response.data?.participants || response.data || [];
      const activeParticipants = participants.filter(p => p.isActive !== false);
      setAllParticipants(activeParticipants);
    } catch (err) {
      console.error('Error loading participants:', err);
      setError('Failed to load participants');
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      let response;
      let filename;

      if (exportType === 'participants') {
        response = await exportParticipantsCsv();
        filename = `participants_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (exportType === 'programs') {
        response = await api.get('/export/programs', { responseType: 'blob' });
        filename = `programs_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        response = await api.get('/export/combined', { responseType: 'blob' });
        filename = `combined_data_${new Date().toISOString().split('T')[0]}.csv`;
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setError(err?.response?.data?.error || 'Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert image URL to base64
  const imageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => {
        // If image fails to load, return null
        resolve(null);
      };
      img.src = url;
    });
  };

  const handlePdfExport = async () => {
    if (selectedParticipants.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    try {
      setPdfLoading(true);
      setError('');
      setSuccess(false);

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const participantWidth = (contentWidth - 10) / 2; // Two participants per row, 10mm gap
      const participantHeight = 80; // Height for each participant card

      let currentY = margin;
      let participantIndex = 0;

      while (participantIndex < selectedParticipants.length) {
        // Check if we need a new page
        if (currentY + participantHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        // Process two participants per row
        for (let col = 0; col < 2 && participantIndex < selectedParticipants.length; col++) {
          const participant = selectedParticipants[participantIndex];
          const x = margin + (col * (participantWidth + 10));

          // Get participant data
          const name = participant.name || 'N/A';
          const address = participant.address || 'N/A';
          const idNumber = participant.identificationNumber || 'N/A';
          const photoUrl = participant.headshotPictureUrl?.url || participant.headshotPictureUrl || null;

          // Draw border for participant card
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.rect(x, currentY, participantWidth, participantHeight);

          // Add profile photo
          if (photoUrl) {
            try {
              const base64Image = await imageToBase64(photoUrl);
              if (base64Image) {
                const imgWidth = 30;
                const imgHeight = 30;
                pdf.addImage(base64Image, 'JPEG', x + 5, currentY + 5, imgWidth, imgHeight);
              }
            } catch (e) {
              console.error('Error loading image:', e);
            }
          }

          // Add participant information
          const textX = photoUrl ? x + 40 : x + 5;
          let textY = currentY + 10;

          // Name
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          pdf.text(name, textX, textY);
          textY += 7;

          // ID Number
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'normal');
          pdf.text(`ID: ${idNumber}`, textX, textY);
          textY += 6;

          // Address (may need to wrap)
          pdf.setFontSize(9);
          const addressLines = pdf.splitTextToSize(`Address: ${address}`, participantWidth - 45);
          pdf.text(addressLines, textX, textY);

          participantIndex++;
        }

        // Move to next row
        currentY += participantHeight + 5;
      }

      // Save PDF
      const filename = `participants_export_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      setSuccess(`PDF exported successfully with ${selectedParticipants.length} participant(s)!`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedParticipants([]);
      setSearchTerm('');
    } catch (err) {
      console.error('PDF export error:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const filteredParticipants = allParticipants.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(searchLower) ||
      p.identificationNumber?.toLowerCase().includes(searchLower) ||
      p.address?.toLowerCase().includes(searchLower)
    );
  });

  const toggleParticipantSelection = (participant) => {
    const isSelected = selectedParticipants.some(p => p.id === participant.id);
    if (isSelected) {
      setSelectedParticipants(selectedParticipants.filter(p => p.id !== participant.id));
    } else {
      setSelectedParticipants([...selectedParticipants, participant]);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Export Data</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Export participant and program data to CSV format for Qualtrics upload and reporting, or export selected participants as PDF.
      </p>

      <div style={{
        background: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '600px'
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>Export Options</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Export Type
          </label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="participants">Participants Only</option>
            <option value="programs">Programs Only</option>
            <option value="combined">Combined Data</option>
          </select>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
            {exportType === 'participants' && 'Export all participant data (excluding images)'}
            {exportType === 'programs' && 'Export all program data'}
            {exportType === 'combined' && 'Export participants and programs in a combined format'}
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

        {success && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            ✅ Export completed successfully! File downloaded.
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={loading}
          style={{
            background: loading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            width: '100%',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Exporting...' : `Export ${exportType.charAt(0).toUpperCase() + exportType.slice(1)}`}
        </button>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#666'
        }}>
          <strong>Note:</strong> The exported CSV file is formatted for Qualtrics upload. Images are excluded from the export. 
          The file will be named with today's date for easy organization.
        </div>
      </div>

      {/* PDF Export Section */}
      <div style={{
        background: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '800px',
        marginTop: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: '0' }}>Export Participants as PDF</h3>
          <button
            onClick={() => {
              setShowPdfExport(!showPdfExport);
              if (!showPdfExport) {
                setSelectedParticipants([]);
                setSearchTerm('');
              }
            }}
            style={{
              background: showPdfExport ? '#6c757d' : '#667eea',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showPdfExport ? 'Hide' : 'Show PDF Export'}
          </button>
        </div>

        {showPdfExport && (
          <div>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
              Select participants to export as PDF. The PDF will include name, address, ID number, and profile photo, with two participants per page.
            </p>

            {/* Search Box */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Search Participants
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID number, or address..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Selected Participants Count */}
            {selectedParticipants.length > 0 && (
              <div style={{
                background: '#e7f3ff',
                padding: '10px 15px',
                borderRadius: '4px',
                marginBottom: '15px',
                fontSize: '14px',
                color: '#0066cc'
              }}>
                <strong>{selectedParticipants.length}</strong> participant(s) selected
              </div>
            )}

            {/* Participant List */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #e1e5e9',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              {filteredParticipants.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  {searchTerm ? 'No participants found matching your search' : 'No participants available'}
                </div>
              ) : (
                filteredParticipants.map((participant) => {
                  const isSelected = selectedParticipants.some(p => p.id === participant.id);
                  return (
                    <div
                      key={participant.id}
                      onClick={() => toggleParticipantSelection(participant)}
                      style={{
                        padding: '12px 15px',
                        borderBottom: '1px solid #e1e5e9',
                        cursor: 'pointer',
                        background: isSelected ? '#e7f3ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'white';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleParticipantSelection(participant)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: 'pointer' }}
                      />
                      {participant.headshotPictureUrl && (
                        <img
                          src={participant.headshotPictureUrl?.url || participant.headshotPictureUrl}
                          alt={participant.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #e1e5e9'
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: '#333' }}>{participant.name}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                          ID: {participant.identificationNumber || 'N/A'}
                          {participant.address && ` • ${participant.address}`}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={handlePdfExport}
              disabled={pdfLoading || selectedParticipants.length === 0}
              style={{
                background: (pdfLoading || selectedParticipants.length === 0) ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                cursor: (pdfLoading || selectedParticipants.length === 0) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                width: '100%',
                opacity: (pdfLoading || selectedParticipants.length === 0) ? 0.6 : 1
              }}
            >
              {pdfLoading ? 'Generating PDF...' : `Export ${selectedParticipants.length} Participant(s) as PDF`}
            </button>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#666'
            }}>
              <strong>Note:</strong> The PDF will include two participants per page with their profile photos, names, addresses, and ID numbers.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Export;
