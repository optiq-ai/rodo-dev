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

// Tymczasowo wyłączamy autoryzację - wszystkie strony są dostępne bez logowania
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
                
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="registers" element={<RegistersPage />} />
                  <Route path="risk-analysis" element={<RiskAnalysisPage />} />
                  <Route path="incidents" element={<Incidents />} />
                  <Route path="requests" element={<Requests />} />
                  <Route path="trainings" element={<Trainings />} />
                  <Route path="compliance" element={<Compliance />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="it-management" element={<ITManagement />} />
                  <Route path="integrations" element={<Integrations />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="help" element={<Help />} />
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
