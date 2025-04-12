import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserManagementPage from '../pages/UserManagementPage';
import { AuthProvider } from '../services/auth/AuthContext';
import { anonymizeData } from '../utils/securityUtils';

// Mock dla funkcji bezpieczeństwa
jest.mock('../utils/securityUtils', () => ({
  sanitizeInput: jest.fn(input => input),
  anonymizeData: jest.fn((data, visibleChars) => `${data.substring(0, visibleChars)}***${data.substring(data.length - visibleChars)}`),
  pseudonymizeData: jest.fn(data => data)
}));

// Mock dla kontekstu uwierzytelniania
jest.mock('../services/auth/AuthContext', () => ({
  ...jest.requireActual('../services/auth/AuthContext'),
  useAuth: () => ({
    user: { username: 'admin', role: 'admin' },
    hasPermission: () => true
  })
}));

describe('UserManagementPage Component', () => {
  const renderUserManagementPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <UserManagementPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders user management page correctly', () => {
    renderUserManagementPage();
    
    // Sprawdzenie, czy główne elementy strony są widoczne
    expect(screen.getByText('Zarządzanie użytkownikami i uprawnieniami')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Użytkownicy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Role/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Uprawnienia/i })).toBeInTheDocument();
    
    // Sprawdzenie, czy tabela użytkowników jest widoczna
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Nazwa użytkownika')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Rola')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('filters users by role', async () => {
    renderUserManagementPage();
    
    // Sprawdzenie, czy wszyscy użytkownicy są początkowo widoczni
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    
    // Wybór filtra roli "Administrator"
    fireEvent.mouseDown(screen.getByLabelText('Rola'));
    fireEvent.click(screen.getByText('Administrator'));
    
    // Sprawdzenie, czy lista została przefiltrowana
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // Nagłówek + co najmniej jeden wiersz z danymi
      expect(rows.length).toBeGreaterThan(1);
      // Sprawdzenie, czy w tabeli jest widoczny użytkownik o roli "Administrator"
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  test('filters users by status', async () => {
    renderUserManagementPage();
    
    // Wybór filtra statusu "Aktywny"
    fireEvent.mouseDown(screen.getByLabelText('Status'));
    fireEvent.click(screen.getByText('Aktywny'));
    
    // Sprawdzenie, czy lista została przefiltrowana
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
      // Sprawdzenie, czy w tabeli są widoczni tylko aktywni użytkownicy
      expect(screen.getAllByText('Aktywny').length).toBeGreaterThan(0);
    });
  });

  test('searches users by username', async () => {
    renderUserManagementPage();
    
    // Wyszukiwanie użytkownika po nazwie
    fireEvent.change(screen.getByLabelText(/Wyszukaj/i), { target: { value: 'admin' } });
    
    // Sprawdzenie, czy lista została przefiltrowana
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
      // Sprawdzenie, czy w tabeli jest widoczny użytkownik zawierający "admin" w nazwie
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  test('toggles sensitive data visibility', async () => {
    renderUserManagementPage();
    
    // Sprawdzenie, czy dane są początkowo zanonimizowane
    expect(anonymizeData).toHaveBeenCalled();
    
    // Kliknięcie przycisku pokazywania danych wrażliwych
    fireEvent.click(screen.getByRole('button', { name: /Pokaż dane wrażliwe/i }));
    
    // Sprawdzenie, czy przycisk zmienił tekst
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Ukryj dane wrażliwe/i })).toBeInTheDocument();
    });
  });

  test('opens add user dialog', async () => {
    renderUserManagementPage();
    
    // Kliknięcie przycisku dodawania użytkownika
    fireEvent.click(screen.getByRole('button', { name: /Dodaj użytkownika/i }));
    
    // Sprawdzenie, czy dialog został otwarty
    await waitFor(() => {
      expect(screen.getByText('Dodaj nowego użytkownika')).toBeInTheDocument();
      expect(screen.getByLabelText('Nazwa użytkownika *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('Rola')).toBeInTheDocument();
    });
  });

  test('adds new user', async () => {
    renderUserManagementPage();
    
    // Kliknięcie przycisku dodawania użytkownika
    fireEvent.click(screen.getByRole('button', { name: /Dodaj użytkownika/i }));
    
    // Wypełnienie formularza
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Nazwa użytkownika *'), { 
        target: { value: 'newuser' } 
      });
      fireEvent.change(screen.getByLabelText('Email *'), { 
        target: { value: 'newuser@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Dział'), { 
        target: { value: 'Test' } 
      });
    });
    
    // Wybór roli
    fireEvent.mouseDown(screen.getByLabelText('Rola'));
    fireEvent.click(screen.getByText('Pracownik'));
    
    // Kliknięcie przycisku dodawania
    fireEvent.click(screen.getByRole('button', { name: /Dodaj użytkownika/i }));
    
    // Sprawdzenie, czy pojawił się komunikat o sukcesie
    await waitFor(() => {
      expect(screen.getByText(/Nowy użytkownik został dodany/i)).toBeInTheDocument();
    });
    
    // Sprawdzenie, czy nowy użytkownik pojawił się w tabeli
    expect(screen.getByText('newuser')).toBeInTheDocument();
  });

  test('switches to roles tab', async () => {
    renderUserManagementPage();
    
    // Kliknięcie zakładki "Role"
    fireEvent.click(screen.getByRole('button', { name: /Role/i }));
    
    // Sprawdzenie, czy tabela ról jest widoczna
    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Nazwa')).toBeInTheDocument();
      expect(screen.getByText('Opis')).toBeInTheDocument();
      expect(screen.getByText('Uprawnienia')).toBeInTheDocument();
    });
  });

  test('opens add role dialog', async () => {
    renderUserManagementPage();
    
    // Przejście do zakładki "Role"
    fireEvent.click(screen.getByRole('button', { name: /Role/i }));
    
    // Kliknięcie przycisku dodawania roli
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Dodaj rolę/i }));
    });
    
    // Sprawdzenie, czy dialog został otwarty
    await waitFor(() => {
      expect(screen.getByText('Dodaj nową rolę')).toBeInTheDocument();
      expect(screen.getByLabelText('ID roli *')).toBeInTheDocument();
      expect(screen.getByLabelText('Nazwa roli *')).toBeInTheDocument();
      expect(screen.getByLabelText('Opis roli')).toBeInTheDocument();
    });
  });

  test('switches to permissions tab', async () => {
    renderUserManagementPage();
    
    // Kliknięcie zakładki "Uprawnienia"
    fireEvent.click(screen.getByRole('button', { name: /Uprawnienia/i }));
    
    // Sprawdzenie, czy tabela uprawnień jest widoczna
    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Nazwa')).toBeInTheDocument();
      expect(screen.getByText('Opis')).toBeInTheDocument();
      expect(screen.getByText('Wszystkie uprawnienia')).toBeInTheDocument();
    });
  });
});
