import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../services/auth/AuthContext';
import IncidentsPage from '../pages/IncidentsPage';
import IncidentService from '../services/incident.service';

// Mock the services
jest.mock('../services/incident.service');
jest.mock('../services/auth/AuthContext', () => {
  const originalModule = jest.requireActual('../services/auth/AuthContext');
  return {
    ...originalModule,
    useAuth: () => ({
      hasPermission: jest.fn().mockImplementation((resource, action) => true),
      currentUser: { id: 1, username: 'testuser', role: 'admin' }
    })
  };
});

describe('IncidentsPage Component', () => {
  const mockIncidents = {
    data: [
      {
        id: 1,
        title: 'Test Incident',
        description: 'This is a test incident',
        severity: 'medium',
        status: 'new',
        date: '2025-04-01T10:00:00Z',
        reportedBy: 'testuser',
        Reporter: { username: 'testuser' }
      },
      {
        id: 2,
        title: 'Another Incident',
        description: 'This is another test incident',
        severity: 'high',
        status: 'in_progress',
        date: '2025-04-02T10:00:00Z',
        reportedBy: 'testuser',
        Reporter: { username: 'testuser' }
      }
    ],
    pagination: {
      total: 2,
      page: 1,
      limit: 10
    }
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock the getIncidents function
    IncidentService.getIncidents.mockResolvedValue(mockIncidents);
    
    // Mock the getIncidentById function
    IncidentService.getIncidentById.mockImplementation((id) => {
      const incident = mockIncidents.data.find(inc => inc.id === id);
      return Promise.resolve(incident || null);
    });
  });

  const renderIncidentsPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <IncidentsPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders incidents page correctly', async () => {
    renderIncidentsPage();
    
    // Check if the page title is rendered
    expect(screen.getByText(/Incidents and Breaches/i)).toBeInTheDocument();
    
    // Check if the "Report Incident" button is rendered
    expect(screen.getByText(/Report Incident/i)).toBeInTheDocument();
    
    // Check if the search and filter controls are rendered
    expect(screen.getByPlaceholderText(/Search by title or description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Severity/i)).toBeInTheDocument();
    
    // Check if the incidents table is rendered with data
    await waitFor(() => {
      expect(screen.getByText('Test Incident')).toBeInTheDocument();
      expect(screen.getByText('Another Incident')).toBeInTheDocument();
    });
    
    // Check if the service was called with correct parameters
    expect(IncidentService.getIncidents).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
      severity: undefined,
      search: undefined
    });
  });

  test('filters incidents when search and filters are applied', async () => {
    renderIncidentsPage();
    
    // Enter search query
    fireEvent.change(screen.getByPlaceholderText(/Search by title or description/i), {
      target: { value: 'test' }
    });
    
    // Select status filter
    fireEvent.change(screen.getByLabelText(/Status/i), {
      target: { value: 'new' }
    });
    
    // Select severity filter
    fireEvent.change(screen.getByLabelText(/Severity/i), {
      target: { value: 'medium' }
    });
    
    // Check if the service was called with updated parameters
    await waitFor(() => {
      expect(IncidentService.getIncidents).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test',
          status: 'new',
          severity: 'medium'
        })
      );
    });
  });

  test('opens create incident dialog when "Report Incident" button is clicked', async () => {
    renderIncidentsPage();
    
    // Click the "Report Incident" button
    fireEvent.click(screen.getByText(/Report Incident/i));
    
    // Check if the dialog is opened with correct title
    await waitFor(() => {
      expect(screen.getByText(/Report New Incident/i)).toBeInTheDocument();
    });
    
    // Check if the form fields are rendered
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Severity/i)).toBeInTheDocument();
  });

  test('creates a new incident when form is submitted', async () => {
    // Mock successful incident creation
    IncidentService.createIncident.mockResolvedValue({
      id: 3,
      title: 'New Incident',
      description: 'This is a new incident',
      severity: 'high',
      status: 'new'
    });
    
    renderIncidentsPage();
    
    // Click the "Report Incident" button
    fireEvent.click(screen.getByText(/Report Incident/i));
    
    // Fill in the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Title/i), {
        target: { value: 'New Incident' }
      });
    });
    
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'This is a new incident' }
    });
    
    fireEvent.change(screen.getByLabelText(/Severity/i), {
      target: { value: 'high' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    
    // Check if the service was called with correct parameters
    await waitFor(() => {
      expect(IncidentService.createIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Incident',
          description: 'This is a new incident',
          severity: 'high'
        })
      );
    });
    
    // Check if the incidents list was refreshed
    expect(IncidentService.getIncidents).toHaveBeenCalledTimes(2);
  });

  test('opens view incident dialog when view button is clicked', async () => {
    renderIncidentsPage();
    
    // Wait for incidents to load
    await waitFor(() => {
      expect(screen.getByText('Test Incident')).toBeInTheDocument();
    });
    
    // Click the view button for the first incident
    const viewButtons = screen.getAllByRole('button', { name: /visibility/i });
    fireEvent.click(viewButtons[0]);
    
    // Check if the service was called with correct ID
    expect(IncidentService.getIncidentById).toHaveBeenCalledWith(1);
    
    // Check if the dialog is opened with incident details
    await waitFor(() => {
      expect(screen.getByText(/Incident Details/i)).toBeInTheDocument();
    });
  });

  test('deletes an incident when delete button is clicked and confirmed', async () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockImplementation(() => true);
    
    // Mock successful incident deletion
    IncidentService.deleteIncident.mockResolvedValue({ message: 'Incident deleted successfully' });
    
    renderIncidentsPage();
    
    // Wait for incidents to load
    await waitFor(() => {
      expect(screen.getByText('Test Incident')).toBeInTheDocument();
    });
    
    // Click the delete button for the first incident
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check if confirmation was requested
    expect(window.confirm).toHaveBeenCalled();
    
    // Check if the service was called with correct ID
    await waitFor(() => {
      expect(IncidentService.deleteIncident).toHaveBeenCalledWith(1);
    });
    
    // Check if the incidents list was refreshed
    expect(IncidentService.getIncidents).toHaveBeenCalledTimes(2);
  });
});
