import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import IncidentsPage from '../pages/IncidentsPage';
import { AuthProvider } from '../services/auth/AuthContext';

// Mock dla kontekstu uwierzytelniania
jest.mock('../services/auth/AuthContext', () => ({
  ...jest.requireActual('../services/auth/AuthContext'),
  useAuth: () => ({
    user: { username: 'testuser', role: 'iod' },
    hasPermission: () => true
  })
}));

describe('IncidentsPage Component', () => {
  const renderIncidentsPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <IncidentsPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders incidents page correctly', () => {
    renderIncidentsPage();
    
    // Sprawdzenie, czy główne elementy strony są widoczne
    expect(screen.getByText('Incydenty i naruszenia')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zgłoś incydent/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Wyszukaj/i)).toBeInTheDocument();
    
    // Sprawdzenie, czy tabela incydentów jest widoczna
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Tytuł')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Poziom ryzyka')).toBeInTheDocument();
  });

  test('filters incidents by status', async () => {
    renderIncidentsPage();
    
    // Sprawdzenie, czy wszystkie incydenty są początkowo widoczne
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    
    // Wybór filtra statusu "Nowy"
    fireEvent.mouseDown(screen.getByLabelText('Status'));
    fireEvent.click(screen.getByText('Nowe'));
    
    // Sprawdzenie, czy lista została przefiltrowana
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // Nagłówek + co najmniej jeden wiersz z danymi
      expect(rows.length).toBeGreaterThan(1);
      // Sprawdzenie, czy w tabeli jest widoczny incydent o statusie "Nowy"
      expect(screen.getByText('Atak phishingowy')).toBeInTheDocument();
    });
  });

  test('filters incidents by severity', async () => {
    renderIncidentsPage();
    
    // Wybór filtra poziomu ryzyka "Wysoki"
    fireEvent.mouseDown(screen.getByLabelText('Poziom ryzyka'));
    fireEvent.click(screen.getByText('Wysoki'));
    
    // Sprawdzenie, czy lista została przefiltrowana
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
      // Sprawdzenie, czy w tabeli jest widoczny incydent o poziomie ryzyka "Wysoki"
      expect(screen.getByText('Wyciek danych klientów')).toBeInTheDocument();
    });
  });

  test('searches incidents by title', async () => {
    renderIncidentsPage();
    
    // Wyszukiwanie incydentu po tytule
    fireEvent.change(screen.getByLabelText(/Wyszukaj/i), { target: { value: 'laptop' } });
    
    // Sprawdzenie, czy lista została przefiltrowana
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
      // Sprawdzenie, czy w tabeli jest widoczny incydent zawierający "laptop" w tytule
      expect(screen.getByText('Utrata laptopa służbowego')).toBeInTheDocument();
    });
  });

  test('opens incident report dialog', async () => {
    renderIncidentsPage();
    
    // Kliknięcie przycisku zgłaszania incydentu
    fireEvent.click(screen.getByRole('button', { name: /Zgłoś incydent/i }));
    
    // Sprawdzenie, czy dialog został otwarty
    await waitFor(() => {
      expect(screen.getByText('Zgłoś nowy incydent')).toBeInTheDocument();
      expect(screen.getByLabelText('Tytuł incydentu *')).toBeInTheDocument();
      expect(screen.getByLabelText('Opis incydentu *')).toBeInTheDocument();
      expect(screen.getByLabelText('Poziom ryzyka')).toBeInTheDocument();
    });
  });

  test('submits new incident report', async () => {
    renderIncidentsPage();
    
    // Kliknięcie przycisku zgłaszania incydentu
    fireEvent.click(screen.getByRole('button', { name: /Zgłoś incydent/i }));
    
    // Wypełnienie formularza
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Tytuł incydentu *'), { 
        target: { value: 'Testowy incydent' } 
      });
      fireEvent.change(screen.getByLabelText('Opis incydentu *'), { 
        target: { value: 'Opis testowego incydentu' } 
      });
      fireEvent.change(screen.getByLabelText('Jakie dane zostały naruszone'), { 
        target: { value: 'Dane testowe' } 
      });
    });
    
    // Kliknięcie przycisku zgłaszania
    fireEvent.click(screen.getByRole('button', { name: /Zgłoś/i }));
    
    // Sprawdzenie, czy pojawił się komunikat o sukcesie
    await waitFor(() => {
      expect(screen.getByText(/Incydent został pomyślnie zgłoszony/i)).toBeInTheDocument();
    });
    
    // Sprawdzenie, czy nowy incydent pojawił się w tabeli
    expect(screen.getByText('Testowy incydent')).toBeInTheDocument();
  });

  test('opens incident details dialog', async () => {
    renderIncidentsPage();
    
    // Kliknięcie przycisku edycji dla pierwszego incydentu
    const editButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(editButtons[0]);
    
    // Sprawdzenie, czy dialog ze szczegółami został otwarty
    await waitFor(() => {
      expect(screen.getByText('Opis incydentu')).toBeInTheDocument();
      expect(screen.getByText('Podjęte działania')).toBeInTheDocument();
    });
  });
});
