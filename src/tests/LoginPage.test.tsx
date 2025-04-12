import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../services/auth/AuthContext';
import LoginPage from '../pages/LoginPage';
import AuthService from '../services/auth.service';

// Mock the auth service
jest.mock('../services/auth.service');

describe('LoginPage Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders login form correctly', () => {
    renderLoginPage();
    
    // Check if the login form elements are rendered
    expect(screen.getByText(/RODO Application Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('shows validation errors when form is submitted with empty fields', async () => {
    renderLoginPage();
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  test('calls login service when form is submitted with valid data', async () => {
    // Mock successful login
    AuthService.login.mockResolvedValue({
      token: 'fake-token',
      user: { id: 1, username: 'testuser', role: 'user' }
    });
    
    renderLoginPage();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'Password123!' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Check if login service was called with correct parameters
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith('testuser', 'Password123!');
    });
  });

  test('shows error message when login fails', async () => {
    // Mock failed login
    const errorMessage = 'Invalid username or password';
    AuthService.login.mockRejectedValue({
      error: { message: errorMessage }
    });
    
    renderLoginPage();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('shows password strength indicator when password is entered', () => {
    renderLoginPage();
    
    // Enter a weak password
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'weak' }
    });
    
    // Check if weak indicator is shown
    expect(screen.getByText(/Weak/i)).toBeInTheDocument();
    
    // Enter a medium strength password
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'Medium123' }
    });
    
    // Check if medium indicator is shown
    expect(screen.getByText(/Medium/i)).toBeInTheDocument();
    
    // Enter a strong password
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'StrongP@ssw0rd!' }
    });
    
    // Check if strong indicator is shown
    expect(screen.getByText(/Strong/i)).toBeInTheDocument();
  });

  test('toggles password visibility when visibility icon is clicked', () => {
    renderLoginPage();
    
    // Enter a password
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'Password123!' }
    });
    
    // Password should be hidden initially
    expect(screen.getByLabelText(/Password/i)).toHaveAttribute('type', 'password');
    
    // Click the visibility toggle button
    fireEvent.click(screen.getByRole('button', { name: /toggle password visibility/i }));
    
    // Password should be visible now
    expect(screen.getByLabelText(/Password/i)).toHaveAttribute('type', 'text');
    
    // Click the visibility toggle button again
    fireEvent.click(screen.getByRole('button', { name: /toggle password visibility/i }));
    
    // Password should be hidden again
    expect(screen.getByLabelText(/Password/i)).toHaveAttribute('type', 'password');
  });
});
