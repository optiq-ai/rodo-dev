import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../services/auth/AuthContext';
import RiskAnalysisPage from '../pages/RiskAnalysisPage';
import RiskAnalysisService from '../services/risk-analysis.service';

// Mock the services
jest.mock('../services/risk-analysis.service');
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

describe('RiskAnalysisPage Component', () => {
  const mockRiskAnalyses = {
    data: [
      {
        id: 1,
        name: 'Test Risk Analysis',
        description: 'This is a test risk analysis',
        status: 'draft',
        riskLevel: 'medium',
        createdAt: '2025-04-01T10:00:00Z',
        createdBy: 'testuser',
        Creator: { username: 'testuser' },
        assets: [
          { name: 'Customer Database', description: 'Database containing customer information' }
        ],
        threats: [
          { name: 'Data Breach', description: 'Unauthorized access to data', probability: 'medium', impact: 'high' }
        ],
        securityMeasures: [
          { name: 'Encryption', description: 'Data encryption at rest and in transit', status: 'implemented' }
        ]
      },
      {
        id: 2,
        name: 'Another Risk Analysis',
        description: 'This is another test risk analysis',
        status: 'completed',
        riskLevel: 'high',
        createdAt: '2025-04-02T10:00:00Z',
        createdBy: 'testuser',
        Creator: { username: 'testuser' },
        assets: [],
        threats: [],
        securityMeasures: []
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
    
    // Mock the getRiskAnalyses function
    RiskAnalysisService.getRiskAnalyses.mockResolvedValue(mockRiskAnalyses);
    
    // Mock the getRiskAnalysisById function
    RiskAnalysisService.getRiskAnalysisById.mockImplementation((id) => {
      const analysis = mockRiskAnalyses.data.find(a => a.id === id);
      return Promise.resolve(analysis || null);
    });
  });

  const renderRiskAnalysisPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <RiskAnalysisPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders risk analysis page correctly', async () => {
    renderRiskAnalysisPage();
    
    // Check if the page title is rendered
    expect(screen.getByText(/Risk Analysis and DPIA/i)).toBeInTheDocument();
    
    // Check if the "New Risk Analysis" button is rendered
    expect(screen.getByText(/New Risk Analysis/i)).toBeInTheDocument();
    
    // Check if the search and filter controls are rendered
    expect(screen.getByPlaceholderText(/Search by name or description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    
    // Check if the risk analyses table is rendered with data
    await waitFor(() => {
      expect(screen.getByText('Test Risk Analysis')).toBeInTheDocument();
      expect(screen.getByText('Another Risk Analysis')).toBeInTheDocument();
    });
    
    // Check if the service was called with correct parameters
    expect(RiskAnalysisService.getRiskAnalyses).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
      search: undefined
    });
  });

  test('filters risk analyses when search and filters are applied', async () => {
    renderRiskAnalysisPage();
    
    // Enter search query
    fireEvent.change(screen.getByPlaceholderText(/Search by name or description/i), {
      target: { value: 'test' }
    });
    
    // Select status filter
    fireEvent.change(screen.getByLabelText(/Status/i), {
      target: { value: 'draft' }
    });
    
    // Check if the service was called with updated parameters
    await waitFor(() => {
      expect(RiskAnalysisService.getRiskAnalyses).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test',
          status: 'draft'
        })
      );
    });
  });

  test('opens create risk analysis dialog when "New Risk Analysis" button is clicked', async () => {
    renderRiskAnalysisPage();
    
    // Click the "New Risk Analysis" button
    fireEvent.click(screen.getByText(/New Risk Analysis/i));
    
    // Check if the dialog is opened with correct title
    await waitFor(() => {
      expect(screen.getByText(/New Risk Analysis/i)).toBeInTheDocument();
    });
    
    // Check if the form fields are rendered
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    
    // Check if tabs are rendered
    expect(screen.getByRole('tab', { name: /General/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Assets/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Threats/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Security Measures/i })).toBeInTheDocument();
  });

  test('creates a new risk analysis when form is submitted', async () => {
    // Mock successful risk analysis creation
    RiskAnalysisService.createRiskAnalysis.mockResolvedValue({
      id: 3,
      name: 'New Risk Analysis',
      description: 'This is a new risk analysis',
      status: 'draft'
    });
    
    renderRiskAnalysisPage();
    
    // Click the "New Risk Analysis" button
    fireEvent.click(screen.getByText(/New Risk Analysis/i));
    
    // Fill in the general form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'New Risk Analysis' }
      });
    });
    
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'This is a new risk analysis' }
    });
    
    // Switch to Assets tab
    fireEvent.click(screen.getByRole('tab', { name: /Assets/i }));
    
    // Add an asset
    fireEvent.click(screen.getByText(/Add Asset/i));
    
    // Fill in asset details
    const assetNameInputs = screen.getAllByLabelText(/Asset Name/i);
    fireEvent.change(assetNameInputs[0], {
      target: { value: 'Test Asset' }
    });
    
    // Switch to Threats tab
    fireEvent.click(screen.getByRole('tab', { name: /Threats/i }));
    
    // Add a threat
    fireEvent.click(screen.getByText(/Add Threat/i));
    
    // Fill in threat details
    const threatNameInputs = screen.getAllByLabelText(/Threat Name/i);
    fireEvent.change(threatNameInputs[0], {
      target: { value: 'Test Threat' }
    });
    
    // Switch to Security Measures tab
    fireEvent.click(screen.getByRole('tab', { name: /Security Measures/i }));
    
    // Add a security measure
    fireEvent.click(screen.getByText(/Add Security Measure/i));
    
    // Fill in security measure details
    const measureNameInputs = screen.getAllByLabelText(/Measure Name/i);
    fireEvent.change(measureNameInputs[0], {
      target: { value: 'Test Measure' }
    });
    
    // Switch back to General tab
    fireEvent.click(screen.getByRole('tab', { name: /General/i }));
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    
    // Check if the service was called with correct parameters
    await waitFor(() => {
      expect(RiskAnalysisService.createRiskAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Risk Analysis',
          description: 'This is a new risk analysis',
          status: 'draft'
        })
      );
    });
    
    // Check if the risk analyses list was refreshed
    expect(RiskAnalysisService.getRiskAnalyses).toHaveBeenCalledTimes(2);
  });

  test('opens view risk analysis dialog when view button is clicked', async () => {
    renderRiskAnalysisPage();
    
    // Wait for risk analyses to load
    await waitFor(() => {
      expect(screen.getByText('Test Risk Analysis')).toBeInTheDocument();
    });
    
    // Click the view button for the first risk analysis
    const viewButtons = screen.getAllByRole('button', { name: /visibility/i });
    fireEvent.click(viewButtons[0]);
    
    // Check if the service was called with correct ID
    expect(RiskAnalysisService.getRiskAnalysisById).toHaveBeenCalledWith(1);
    
    // Check if the dialog is opened with risk analysis details
    await waitFor(() => {
      expect(screen.getByText(/Risk Analysis Details/i)).toBeInTheDocument();
    });
  });

  test('deletes a risk analysis when delete button is clicked and confirmed', async () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockImplementation(() => true);
    
    // Mock successful risk analysis deletion
    RiskAnalysisService.deleteRiskAnalysis.mockResolvedValue({ message: 'Risk analysis deleted successfully' });
    
    renderRiskAnalysisPage();
    
    // Wait for risk analyses to load
    await waitFor(() => {
      expect(screen.getByText('Test Risk Analysis')).toBeInTheDocument();
    });
    
    // Click the delete button for the first risk analysis
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check if confirmation was requested
    expect(window.confirm).toHaveBeenCalled();
    
    // Check if the service was called with correct ID
    await waitFor(() => {
      expect(RiskAnalysisService.deleteRiskAnalysis).toHaveBeenCalledWith(1);
    });
    
    // Check if the risk analyses list was refreshed
    expect(RiskAnalysisService.getRiskAnalyses).toHaveBeenCalledTimes(2);
  });
});
