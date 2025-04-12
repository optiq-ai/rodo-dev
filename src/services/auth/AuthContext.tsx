import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { secureLocalStorage, hashPassword, verifyPassword } from '../../utils/securityUtils';

// Definicja typów dla kontekstu uwierzytelniania
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'iod' | 'employee';
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

// Tworzenie kontekstu uwierzytelniania
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook do używania kontekstu uwierzytelniania
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Przykładowi użytkownicy (w rzeczywistej aplikacji byliby pobierani z API)
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: hashPassword('admin123'), // Używamy hashPassword zamiast przechowywania jawnych haseł
    role: 'admin',
    permissions: ['all'],
  },
  {
    id: '2',
    username: 'iod',
    email: 'iod@example.com',
    password: hashPassword('iod123'),
    role: 'iod',
    permissions: ['view_all', 'edit_documents', 'manage_requests', 'view_reports'],
  },
  {
    id: '3',
    username: 'employee',
    email: 'employee@example.com',
    password: hashPassword('employee123'),
    role: 'employee',
    permissions: ['view_documents', 'report_incidents'],
  },
];

// Provider kontekstu uwierzytelniania
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Sprawdzenie, czy użytkownik jest już zalogowany (z secureLocalStorage)
    return secureLocalStorage.getItem('user');
  });

  const isAuthenticated = !!user;

  // Efekt do automatycznego wylogowania po czasie bezczynności
  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // Wyloguj po 30 minutach bezczynności
      inactivityTimer = setTimeout(() => {
        logout();
        alert('Zostałeś automatycznie wylogowany z powodu braku aktywności.');
      }, 30 * 60 * 1000);
    };

    // Resetuj timer przy każdej aktywności użytkownika
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    resetTimer();
    
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated]);

  const login = async (username: string, password: string): Promise<boolean> => {
    // W rzeczywistej aplikacji, to byłoby zapytanie do API
    const foundUser = mockUsers.find(
      (u) => u.username === username && verifyPassword(password, u.password)
    );

    if (foundUser) {
      // Usunięcie hasła przed zapisaniem użytkownika
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      
      // Używamy secureLocalStorage zamiast zwykłego localStorage
      secureLocalStorage.setItem('user', userWithoutPassword);
      
      // Zapisujemy czas logowania
      secureLocalStorage.setItem('lastActivity', new Date().toISOString());
      
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    secureLocalStorage.removeItem('user');
    secureLocalStorage.removeItem('lastActivity');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin' || user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
