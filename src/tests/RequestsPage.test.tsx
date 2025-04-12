import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../services/auth/AuthContext';
import RequestsPage from '../pages/RequestsPage';
import RequestService from '../services/request.service';

// Mock the services
jest.mock('../services/request.service');
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

describe('RequestsPage Component', () => {
  const mockRequests = {
    data: [
      {
        id: 1,
        dataSubject: 'John Doe',
        type: 'access',
        typeName: 'Access to Data',
        submissionDate: '2025-04-01T10:00:00Z',
        deadlineDate: '2025-05-01T10:00:00Z',
        status: 'new',
        contactInfo: 'john.doe@example.com',
        description: 'Request for personal data access'
      },
      {
        id: 2,
        dataSubject: 'Jane Smith',
        type: 'erasure',
        typeName: 'Data Erasure',
        submissionDate: '2025-04-02T10:00:00Z',
        deadlineDate: '2025-05-02T10:00:00Z',
        status: 'in_progress',
        contactInfo: 'jane.smith@example.com',
        description: 'Request for data erasure'
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
    
    // Mock the getRequests function
    RequestService.getRequests.mockResolvedValue(mockRequests);
    
    // Mock the getRequestById function
    RequestService.getRequestById.mockImplementation((id) => {
      const request = mockRequests.data.find(req => req.id === id);
      return Promise.resolve(request || null);
    });
  });

  const renderRequestsPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <RequestsPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders requests page correctly', async () => {
    renderRequestsPage();
    
    // Check if the page title is rendered
    expect(screen.getByText(/Data Subject Requests/i)).toBeInTheDocument();
    
    // Check if the "New Request" button is rendered
    expect(screen.getByText(/New Request/i)).toBeInTheDocument();
    
    // Check if the search and filter controls are rendered
    expect(screen.getByPlaceholderText(/Search by data subject or description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
    
    // Check if the requests table is rendered with data
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    // Check if the service was called with correct parameters
    expect(RequestService.getRequests).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
      type: undefined,
      search: undefined
    });
  });

  test('filters requests when search and filters are applied', async () => {
    renderRequestsPage();
    
    // Enter search query
    fireEvent.change(screen.getByPlaceholderText(/Search by data subject or description/i), {
      target: { value: 'john' }
    });
    
    // Select status filter
    fireEvent.change(screen.getByLabelText(/Status/i), {
      target: { value: 'new' }
    });
    
    // Select type filter
    fireEvent.change(screen.getByLabelText(/Type/i), {
      target: { value: 'access' }
    });
    
    // Check if the service was called with updated parameters
    await waitFor(() => {
      expect(RequestService.getRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'john',
          status: 'new',
          type: 'access'
        })
      );
    });
  });

  test('opens create request dialog when "New Request" button is clicked', async () => {
    renderRequestsPage();
    
    // Click the "New Request" button
    fireEvent.click(screen.getByText(/New Request/i));
    
    // Check if the dialog is opened with correct title
    await waitFor(() => {
      expect(screen.getByText(/New Data Subject Request/i)).toBeInTheDocument();
    });
    
    // Check if the form fields are rendered
    expect(screen.getByLabelText(/Request Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data Subject Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Request Description/i)).toBeInTheDocument();
  });

  test('creates a new request when form is submitted', async () => {
    // Mock successful request creation
    RequestService.createRequest.mockResolvedValue({
      id: 3,
      dataSubject: 'New Subject',
      type: 'rectification',
      status: 'new'
    });
    
    renderRequestsPage();
    
    // Click the "New Request" button
    fireEvent.click(screen.getByText(/New Request/i));
    
    // Fill in the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Request Type/i), {
        target: { value: 'rectification' }
      });
    });
    
    fireEvent.change(screen.getByLabelText(/Data Subject Name/i), {
      target: { value: 'New Subject' }
    });
    
    fireEvent.change(screen.getByLabelText(/Contact Information/i), {
      target: { value: 'new.subject@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Request Description/i), {
      target: { value: 'This is a new request for data rectification' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    
    // Check if the service was called with correct parameters
    await waitFor(() => {
      expect(RequestService.createRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rectification',
          dataSubject: 'New Subject',
          contactInfo: 'new.subject@example.com',
          description: 'This is a new request for data rectification'
        })
      );
    });
    
    // Check if the requests list was refreshed
    expect(RequestService.getRequests).toHaveBeenCalledTimes(2);
  });

  test('opens view request dialog when view button is clicked', async () => {
    renderRequestsPage();
    
    // Wait for requests to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Click the view button for the first request
    const viewButtons = screen.getAllByRole('button', { name: /visibility/i });
    fireEvent.click(viewButtons[0]);
    
    // Check if the service was called with correct ID
    expect(RequestService.getRequestById).toHaveBeenCalledWith(1);
    
    // Check if the dialog is opened with request details
    await waitFor(() => {
      expect(screen.getByText(/Request Details/i)).toBeInTheDocument();
    });
  });

  test('deletes a request when delete button is clicked and confirmed', async () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockImplementation(() => true);
    
    // Mock successful request deletion
    RequestService.deleteRequest.mockResolvedValue({ message: 'Request deleted successfully' });
    
    renderRequestsPage();
    
    // Wait for requests to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Click the delete button for the first request
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check if confirmation was requested
    expect(window.confirm).toHaveBeenCalled();
    
    // Check if the service was called with correct ID
    await waitFor(() => {
      expect(RequestService.deleteRequest).toHaveBeenCalledWith(1);
    });
    
    // Check if the requests list was refreshed
    expect(RequestService.getRequests).toHaveBeenCalledTimes(2);
  });
});
