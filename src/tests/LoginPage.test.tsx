import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../services/auth/AuthContext';

// Mock dla funkcji nawigacji
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: { from: { pathname: '/' } } }),
}));

describe('LoginPage Component', () => {
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
    
    // Sprawdzenie, czy elementy formularza są widoczne
    expect(screen.getByText('Logowanie do aplikacji RODO')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nazwa użytkownika/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zaloguj się/i })).toBeInTheDocument();
  });

  test('validates empty form fields', async () => {
    renderLoginPage();
    
    // Kliknięcie przycisku logowania bez wypełnienia pól
    fireEvent.click(screen.getByRole('button', { name: /Zaloguj się/i }));
    
    // Sprawdzenie, czy pojawił się komunikat o błędzie
    await waitFor(() => {
      expect(screen.getByText('Proszę wprowadzić nazwę użytkownika i hasło')).toBeInTheDocument();
    });
  });

  test('shows password strength indicator when typing password', async () => {
    renderLoginPage();
    
    // Wprowadzenie słabego hasła
    fireEvent.change(screen.getByLabelText(/Hasło/i), { target: { value: 'weak' } });
    
    // Sprawdzenie, czy pojawił się wskaźnik siły hasła
    await waitFor(() => {
      expect(screen.getByText(/Hasło jest zbyt słabe/i)).toBeInTheDocument();
    });
    
    // Wprowadzenie silnego hasła
    fireEvent.change(screen.getByLabelText(/Hasło/i), { target: { value: 'StrongP@ssw0rd' } });
    
    // Sprawdzenie, czy wskaźnik siły hasła się zmienił
    await waitFor(() => {
      expect(screen.getByText(/Hasło jest silne/i)).toBeInTheDocument();
    });
  });

  test('toggles password visibility', () => {
    renderLoginPage();
    
    // Wprowadzenie hasła
    fireEvent.change(screen.getByLabelText(/Hasło/i), { target: { value: 'test123' } });
    
    // Sprawdzenie, czy pole jest typu password (hasło ukryte)
    expect(screen.getByLabelText(/Hasło/i)).toHaveAttribute('type', 'password');
    
    // Kliknięcie przycisku pokazywania hasła
    fireEvent.click(screen.getByLabelText(/toggle password visibility/i));
    
    // Sprawdzenie, czy pole jest typu text (hasło widoczne)
    expect(screen.getByLabelText(/Hasło/i)).toHaveAttribute('type', 'text');
  });

  test('attempts login with valid credentials', async () => {
    renderLoginPage();
    
    // Wprowadzenie poprawnych danych logowania
    fireEvent.change(screen.getByLabelText(/Nazwa użytkownika/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Hasło/i), { target: { value: 'admin123' } });
    
    // Kliknięcie przycisku logowania
    fireEvent.click(screen.getByRole('button', { name: /Zaloguj się/i }));
    
    // Sprawdzenie, czy pojawił się wskaźnik ładowania
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    
    // Sprawdzenie, czy pojawił się komunikat o pomyślnym logowaniu
    await waitFor(() => {
      expect(screen.getByText(/Logowanie pomyślne/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('shows error for invalid credentials', async () => {
    renderLoginPage();
    
    // Wprowadzenie niepoprawnych danych logowania
    fireEvent.change(screen.getByLabelText(/Nazwa użytkownika/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText(/Hasło/i), { target: { value: 'wrong' } });
    
    // Kliknięcie przycisku logowania
    fireEvent.click(screen.getByRole('button', { name: /Zaloguj się/i }));
    
    // Sprawdzenie, czy pojawił się komunikat o błędzie
    await waitFor(() => {
      expect(screen.getByText(/Nieprawidłowa nazwa użytkownika lub hasło/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
