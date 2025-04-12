import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RequestsPage from '../pages/RequestsPage';
import { AuthProvider } from '../services/auth/AuthContext';

// Mock dla kontekstu uwierzytelniania
jest.mock('../services/auth/AuthContext', () => ({
  ...jest.requireActual('../services/auth/AuthContext'),
  useAuth: () => ({
    user: { username: 'testuser', role: 'iod' },
    hasPermission: () => true
  })
}));

describe('RequestsPage Component', () => {
  const renderRequestsPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <RequestsPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders requests page correctly', () => {
    renderRequestsPage();
    
    // Sprawdzenie, czy główne elementy strony są widoczne
    expect(screen.getByText('Wnioski podmiotów danych')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nowy wniosek/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Wyszukaj/i)).toBeInTheDocument();
    
    // Sprawdzenie, czy tabela wniosków jest widoczna
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Wnioskodawca')).toBeInTheDocument();
    expect(screen.getByText('Typ wniosku')).toBeInTheDocument();
    expect(screen.getByText('Data złożenia')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('filters requests by status', async () => {
    renderRequestsPage();
    
    // Sprawdzenie, czy wszystkie wnioski są początkowo widoczne
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    
    // Wybór filtra statusu "Nowy"
    fireEvent.mouseDown(screen.getByLabelText('Status'));
    fireEvent.click(screen.getByText('Nowe'));
    
    // Sprawdzenie, czy lista została przefiltrowana
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // Nagłówek + co najmniej jeden wiersz z danymi
      expect(rows.length).toBeGreaterThan(1);
      // Sprawdzenie, czy w tabeli jest widoczny wniosek o statusie "Nowy"
      expect(screen.getByText('Maria Wiśniewska')).toBeInTheDocument();
    });
  });

  test('filters requests by type', async () => {
    renderRequestsPage();
    
    // Wybór filtra typu wniosku "Usunięcie danych"
    fireEvent.mouseDown(screen.getByLabelText('Typ wniosku'));
    fireEvent.click(screen.getByText('Usunięcie danych'));
    
    // Sprawdzenie, czy lista została przefiltrowana
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
      // Sprawdzenie, czy w tabeli jest widoczny wniosek o typie "Usunięcie danych"
      expect(screen.getByText('Maria Wiśniewska')).toBeInTheDocument();
    });
  });

  test('searches requests by subject name', async () => {
    renderRequestsPage();
    
    // Wyszukiwanie wniosku po nazwie wnioskodawcy
    fireEvent.change(screen.getByLabelText(/Wyszukaj/i), { target: { value: 'Kowalski' } });
    
    // Sprawdzenie, czy lista została przefiltrowana
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
      // Sprawdzenie, czy w tabeli jest widoczny wniosek zawierający "Kowalski" w nazwie wnioskodawcy
      expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
    });
  });

  test('opens new request dialog', async () => {
    renderRequestsPage();
    
    // Kliknięcie przycisku nowego wniosku
    fireEvent.click(screen.getByRole('button', { name: /Nowy wniosek/i }));
    
    // Sprawdzenie, czy dialog został otwarty
    await waitFor(() => {
      expect(screen.getByText('Nowy wniosek podmiotu danych')).toBeInTheDocument();
      expect(screen.getByText('Dane wnioskodawcy')).toBeInTheDocument();
    });
  });

  test('navigates through request form steps', async () => {
    renderRequestsPage();
    
    // Kliknięcie przycisku nowego wniosku
    fireEvent.click(screen.getByRole('button', { name: /Nowy wniosek/i }));
    
    // Wypełnienie pierwszego kroku formularza
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Imię i nazwisko wnioskodawcy/i), { 
        target: { value: 'Test Testowy' } 
      });
      fireEvent.change(screen.getByLabelText(/Dane kontaktowe/i), { 
        target: { value: 'test@example.com' } 
      });
    });
    
    // Przejście do następnego kroku
    fireEvent.click(screen.getByRole('button', { name: /Dalej/i }));
    
    // Sprawdzenie, czy drugi krok jest widoczny
    await waitFor(() => {
      expect(screen.getByLabelText('Typ wniosku')).toBeInTheDocument();
    });
    
    // Wybór typu wniosku
    fireEvent.mouseDown(screen.getByLabelText('Typ wniosku'));
    fireEvent.click(screen.getByText('Dostęp do danych'));
    
    // Przejście do następnego kroku
    fireEvent.click(screen.getByRole('button', { name: /Dalej/i }));
    
    // Sprawdzenie, czy trzeci krok jest widoczny
    await waitFor(() => {
      expect(screen.getByLabelText(/Szczegółowy opis wniosku/i)).toBeInTheDocument();
    });
    
    // Wypełnienie opisu wniosku
    fireEvent.change(screen.getByLabelText(/Szczegółowy opis wniosku/i), { 
      target: { value: 'Opis testowego wniosku o dostęp do danych' } 
    });
    
    // Przejście do następnego kroku
    fireEvent.click(screen.getByRole('button', { name: /Dalej/i }));
    
    // Sprawdzenie, czy podsumowanie jest widoczne
    await waitFor(() => {
      expect(screen.getByText('Podsumowanie wniosku')).toBeInTheDocument();
      expect(screen.getByText('Test Testowy')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Dostęp do danych')).toBeInTheDocument();
      expect(screen.getByText('Opis testowego wniosku o dostęp do danych')).toBeInTheDocument();
    });
  });

  test('submits new request', async () => {
    renderRequestsPage();
    
    // Kliknięcie przycisku nowego wniosku
    fireEvent.click(screen.getByRole('button', { name: /Nowy wniosek/i }));
    
    // Wypełnienie pierwszego kroku formularza
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Imię i nazwisko wnioskodawcy/i), { 
        target: { value: 'Test Testowy' } 
      });
      fireEvent.change(screen.getByLabelText(/Dane kontaktowe/i), { 
        target: { value: 'test@example.com' } 
      });
    });
    
    // Przejście przez wszystkie kroki formularza
    fireEvent.click(screen.getByRole('button', { name: /Dalej/i }));
    await waitFor(() => {
      expect(screen.getByLabelText('Typ wniosku')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Dalej/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/Szczegółowy opis wniosku/i)).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/Szczegółowy opis wniosku/i), { 
      target: { value: 'Opis testowego wniosku' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Dalej/i }));
    await waitFor(() => {
      expect(screen.getByText('Podsumowanie wniosku')).toBeInTheDocument();
    });
    
    // Złożenie wniosku
    fireEvent.click(screen.getByRole('button', { name: /Złóż wniosek/i }));
    
    // Sprawdzenie, czy pojawił się komunikat o sukcesie
    await waitFor(() => {
      expect(screen.getByText(/Wniosek został pomyślnie złożony/i)).toBeInTheDocument();
    });
  });

  test('opens request details dialog', async () => {
    renderRequestsPage();
    
    // Kliknięcie przycisku podglądu dla pierwszego wniosku
    const viewButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(viewButtons[0]);
    
    // Sprawdzenie, czy dialog ze szczegółami został otwarty
    await waitFor(() => {
      expect(screen.getByText(/Wniosek:/i)).toBeInTheDocument();
      expect(screen.getByText('Wnioskodawca')).toBeInTheDocument();
      expect(screen.getByText('Dane kontaktowe')).toBeInTheDocument();
      expect(screen.getByText('Opis wniosku')).toBeInTheDocument();
    });
  });
});
