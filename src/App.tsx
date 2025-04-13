import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import theme from './theme/theme';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import DocumentsPage from './pages/DocumentsPage';
import RegistersPage from './pages/RegistersPage';
import RiskAnalysisPage from './pages/RiskAnalysisPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './services/auth/AuthContext';
import ProtectedRoute from './services/auth/ProtectedRoute';
import WebSocketProvider from './services/WebSocketProvider';

// Placeholder components for other pages
const Incidents = () => <div>Incydenty i naruszenia</div>;
const Requests = () => <div>Wnioski podmiotów</div>;
const Trainings = () => <div>Szkolenia i edukacja</div>;
const Compliance = () => <div>Monitorowanie zgodności</div>;
const Notifications = () => <div>Terminy i powiadomienia</div>;
const Reports = () => <div>Raportowanie i analityka</div>;
const ITManagement = () => <div>Zarządzanie IT</div>;
const Integrations = () => <div>Integracja z systemami</div>;
const Settings = () => <div>Ustawienia</div>;
const Help = () => <div>Pomoc</div>;
const Forbidden = () => <div>Brak dostępu - nie masz wymaganych uprawnień</div>;

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <AuthProvider>
        <WebSocketProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forbidden" element={<Forbidden />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="documents" element={
                    <ProtectedRoute requiredPermission="view_documents">
                      <DocumentsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="registers" element={
                    <ProtectedRoute requiredPermission="view_all">
                      <RegistersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="risk-analysis" element={
                    <ProtectedRoute requiredPermission="view_all">
                      <RiskAnalysisPage />
                    </ProtectedRoute>
                  } />
                  <Route path="incidents" element={
                    <ProtectedRoute requiredPermission="view_all">
                      <Incidents />
                    </ProtectedRoute>
                  } />
                  <Route path="requests" element={
                    <ProtectedRoute requiredPermission="manage_requests">
                      <Requests />
                    </ProtectedRoute>
                  } />
                  <Route path="trainings" element={
                    <ProtectedRoute>
                      <Trainings />
                    </ProtectedRoute>
                  } />
                  <Route path="compliance" element={
                    <ProtectedRoute requiredPermission="view_all">
                      <Compliance />
                    </ProtectedRoute>
                  } />
                  <Route path="notifications" element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } />
                  <Route path="reports" element={
                    <ProtectedRoute requiredPermission="view_reports">
                      <Reports />
                    </ProtectedRoute>
                  } />
                  <Route path="it-management" element={
                    <ProtectedRoute requiredPermission="view_all">
                      <ITManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="integrations" element={
                    <ProtectedRoute requiredPermission="view_all">
                      <Integrations />
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute requiredPermission="all">
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="help" element={
                    <ProtectedRoute>
                      <Help />
                    </ProtectedRoute>
                  } />
                </Route>
              </Routes>
            </Router>
          </ThemeProvider>
        </WebSocketProvider>
      </AuthProvider>
    </SnackbarProvider>
  );
}

export default App;
