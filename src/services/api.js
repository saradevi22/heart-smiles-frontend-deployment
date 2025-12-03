import axios from 'axios';

// Determine the base URL based on environment
// Production (Vercel) backend URL
// Note: Vercel deployment URLs may change - update this if you see a different URL
const PRODUCTION_API_URL = 'https://heart-smiles-backend-deployment-6zzg-fjsexytwl.vercel.app';
// Local development URL
const LOCAL_API_URL = 'http://localhost:5001/api';

// Helper function to normalize URL (remove duplicate https://, ensure /api suffix for production)
const normalizeURL = (url, isProduction = false) => {
  if (!url) return url;
  // Remove duplicate https://
  let normalized = url.replace(/https?:\/\/https?:\/\//g, 'https://');
  // Ensure it starts with http:// or https://
  if (!normalized.match(/^https?:\/\//)) {
    normalized = 'https://' + normalized.replace(/^https?:\/\//, '');
  }
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  // For production Vercel URLs, ensure /api suffix is present
  if (isProduction && normalized.includes('vercel.app') && !normalized.endsWith('/api')) {
    normalized = normalized + '/api';
  }
  return normalized;
};

// Use environment variable if set, otherwise use production URL in production, localhost in development
const envURL = process.env.REACT_APP_API_BASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const baseURL = envURL ? normalizeURL(envURL, isProduction) : 
  (isProduction ? PRODUCTION_API_URL : LOCAL_API_URL);

console.log('=== API CONFIGURATION ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('Is Production:', isProduction);
console.log('Env URL:', envURL);
console.log('Production URL:', PRODUCTION_API_URL);
console.log('Local URL:', LOCAL_API_URL);
console.log('Final Base URL:', baseURL);
console.log('=========================');

const api = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  timeout: 10000 // 10 second timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log('API Request:', config.method?.toUpperCase(), `${config.baseURL}${config.url}`, config.data);
  return config;
}, (error) => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    const fullURL = error.config ? `${error.config.baseURL || ''}${error.config.url || ''}` : 'unknown';
    
    console.error('=== API ERROR DETAILS ===');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Full URL:', fullURL);
    console.error('Base URL:', error.config?.baseURL);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Has Response:', !!error.response);
    console.error('Response Status:', error.response?.status);
    console.error('Response Data:', error.response?.data);
    console.error('========================');
    
    // Log network errors specifically
    if (!error.response) {
      console.error('Network Error - No response from server');
      console.error('This usually means:');
      console.error('1. The server is unreachable (wrong URL, server down)');
      console.error('2. CORS preflight failed (OPTIONS request blocked)');
      console.error('3. Network connectivity issue');
      console.error('4. Request was blocked by browser/extension');
      console.error('');
      console.error('Troubleshooting:');
      console.error('- Check if the backend URL is correct:', error.config?.baseURL);
      console.error('- Try accessing the backend directly in browser:', fullURL);
      console.error('- Check browser console for CORS errors');
      console.error('- Verify backend is deployed and running');
    }
    
    // Handle authentication errors (401)
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || '';
      
      // Check if it's a token-related error (expired, invalid, etc.)
      if (errorMessage.includes('expired') || 
          errorMessage.includes('Token expired') || 
          errorMessage.includes('Invalid token') ||
          errorMessage.includes('Access token required')) {
        // Clear token and user data
        localStorage.removeItem('hs_token');
        localStorage.removeItem('hs_user');
        
        // Dispatch custom event to notify AuthContext
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
        
        // Redirect to login page (only if not already on login/landing)
        if (window.location.pathname !== '/login' && window.location.pathname !== '/landing') {
          const redirectParam = errorMessage.includes('expired') ? '?expired=true' : '?invalid=true';
          window.location.href = `/login${redirectParam}`;
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const loginUser = (email, password) => api.post('/auth/login', { email, password });
export const registerUser = (payload) => {
  console.log('API: Making registration request to:', api.defaults.baseURL + '/auth/register');
  console.log('API: Payload:', payload);
  return api.post('/auth/register', payload);
};

// Participants
export const fetchParticipants = () => api.get('/participants');
export const fetchParticipantById = (id) => api.get(`/participants/${id}`);
export const createParticipant = (payload) => api.post('/participants', payload);
export const updateParticipant = (id, payload) => api.put(`/participants/${id}`, payload);
export const deleteParticipant = (id) => api.delete(`/participants/${id}`);
export const addParticipantNote = (id, noteData) => api.post(`/participants/${id}/notes`, noteData);
export const deleteParticipantNote = (id, noteId) => api.delete(`/participants/${id}/notes/${noteId}`);
export const uploadImage = (formData) => api.post('/upload/single', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const addParticipantPhoto = async (id, { type, imageData, uploadedAt, caption, activity, programName }) => {
  if (type === 'headshot') {
    return api.put(`/participants/${id}/profile-photo`, { imageData });
  } else {
    return api.post(`/participants/${id}/program-photo`, { imageData, uploadedAt, caption, activity, programName });
  }
};
export const deleteParticipantPhoto = (id, photoId) => api.delete(`/participants/${id}/program-photo/${photoId}`);

// Programs
export const fetchPrograms = () => api.get('/programs');
// Fetch single program by ID
export const fetchProgramById = (id) => api.get(`/programs/${id}`);
// Fetch single program by name
export const fetchProgramByName = (name) =>
  api.get(`/programs/name/${encodeURIComponent(name)}`);
// Create new program
export const createProgram = (payload) => api.post('/programs', payload);
// Update program by ID
export const updateProgramById = (id, payload) => api.put(`/programs/${id}`, payload);
// Update program by name
export const updateProgram = (name, payload) =>
  api.put(`/programs/name/${encodeURIComponent(name)}`, payload);
// Delete program by ID
export const deleteProgramById = (id) => api.delete(`/programs/${id}`);
// Delete program by name (fetches by name first, then deletes by ID)
export const deleteProgram = async (name) => {
  // First fetch the program by name to get its ID
  const programResponse = await fetchProgramByName(name);
  const programId = programResponse.data.program.id;
  // Then delete by ID
  return api.delete(`/programs/${programId}`);
};
// Add a participant to a program by name
export const addParticipant = (programName, participantData) =>
  api.post(`/programs/name/${encodeURIComponent(programName)}/participants`, participantData);
// Remove a participant from a program by name
export const removeParticipant = (programName, participantId) =>
  api.delete(`/programs/name/${encodeURIComponent(programName)}/participants/${participantId}`);
// Remove participant from program (for participant edit)
export const removeParticipantFromProgram = (participantId, programId) =>
  api.delete(`/participants/${participantId}/programs/${programId}`);
// Add participant to program (for participant edit)
export const addParticipantToProgram = (participantId, programId) =>
  api.post(`/participants/${participantId}/programs/${programId}`);

// Staff
export const fetchStaff = () => api.get('/staff');
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

// Import/Export
export const exportParticipantsCsv = () => api.get('/export/participants', { responseType: 'blob' });
export const importParticipantsFile = (file, dryRun = true) => {
  const form = new FormData();
  form.append('file', file);
  form.append('dryRun', String(dryRun));
  return api.post('/import/participants', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};