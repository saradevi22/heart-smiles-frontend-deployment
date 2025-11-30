import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Participants from './pages/Participants';
import ParticipantDetail from './pages/ParticipantDetail';
import ParticipantEdit from './pages/ParticipantEdit';
import Programs from './pages/Programs';
import ProgramsDetail from './pages/ProgramsDetail';
import ProgramsEdit from './pages/ProgramsEdit';
import Staff from './pages/Staff';
import ImportPage from './pages/Import';
import ExportPage from './pages/Export';

// Redirect authenticated users away from landing/login/register
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// Root route - redirect to landing or dashboard based on auth
function RootRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />;
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/landing" element={<Landing />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
          </Route>
          <Route path="/participants" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Participants />} />
            <Route path=":id" element={<ParticipantDetail />} />
            <Route path=":id/edit" element={<ParticipantEdit />} />
          </Route>
          <Route path="/programs" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Programs />} />
            <Route path=":name" element={<ProgramsDetail />} />
            <Route path=":name/edit" element={<ProgramsEdit />} />
          </Route>
          <Route path="/staff" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Staff />} />
          </Route>
          <Route path="/import" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<ImportPage />} />
          </Route>
          <Route path="/export" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<ExportPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
