import CryptoJS from 'crypto-js';

// Klucz szyfrujący (w produkcji powinien być przechowywany w bezpiecznym miejscu)
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-encryption-key';

/**
 * Bezpieczne localStorage z szyfrowaniem
 */
export const secureLocalStorage = {
  setItem: (key: string, value: any): void => {
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const encryptedValue = CryptoJS.AES.encrypt(valueToStore, ENCRYPTION_KEY).toString();
    localStorage.setItem(key, encryptedValue);
  },
  
  getItem: (key: string): any => {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
      const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
      
      try {
        // Próba parsowania jako JSON
        return JSON.parse(decryptedValue);
      } catch (e) {
        // Jeśli nie jest to JSON, zwróć jako string
        return decryptedValue;
      }
    } catch (e) {
      console.error('Error decrypting value from localStorage:', e);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  }
};

/**
 * Szyfruje dane przy użyciu algorytmu AES
 * @param {string|object} data - Dane do zaszyfrowania
 * @returns {string} - Zaszyfrowane dane
 */
export const encryptData = (data: string | object): string => {
  const dataString = typeof data === 'object' ? JSON.stringify(data) : data;
  return CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
};

/**
 * Deszyfruje dane zaszyfrowane algorytmem AES
 * @param {string} encryptedData - Zaszyfrowane dane
 * @returns {string} - Odszyfrowane dane
 */
export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Hashuje hasło przy użyciu SHA-256
 * @param {string} password - Hasło do zahashowania
 * @returns {string} - Zahashowane hasło
 */
export const hashPassword = (password: string): string => {
  // W rzeczywistej implementacji należy użyć soli i bardziej zaawansowanych algorytmów
  return CryptoJS.SHA256(password).toString();
};

/**
 * Weryfikuje hasło z jego hashem
 * @param {string} password - Hasło do weryfikacji
 * @param {string} hash - Hash hasła
 * @returns {boolean} - Czy hasło jest poprawne
 */
export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

/**
 * Sanityzuje dane wejściowe, usuwając potencjalnie niebezpieczne znaki
 * @param {string} input - Dane wejściowe
 * @returns {string} - Sanityzowane dane
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Zamiana znaków specjalnych na encje HTML
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Waliduje adres email
 * @param {string} email - Adres email do walidacji
 * @returns {boolean} - Czy adres email jest poprawny
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

/**
 * Waliduje siłę hasła
 * @param {string} password - Hasło do walidacji
 * @returns {object} - Obiekt zawierający informacje o sile hasła
 */
export const validatePassword = (password: string): { isValid: boolean; strength: 'none' | 'weak' | 'medium' | 'strong'; message: string } => {
  if (!password) {
    return { isValid: false, strength: 'none', message: 'Hasło jest wymagane' };
  }

  // Sprawdzenie długości
  if (password.length < 8) {
    return { isValid: false, strength: 'weak', message: 'Hasło jest zbyt krótkie (min. 8 znaków)' };
  }

  // Sprawdzenie złożoności
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const complexity = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  if (complexity === 4) {
    return { isValid: true, strength: 'strong', message: 'Hasło jest silne' };
  } else if (complexity >= 2) {
    return { isValid: true, strength: 'medium', message: 'Hasło jest średnie' };
  } else {
    return { isValid: false, strength: 'weak', message: 'Hasło jest zbyt słabe' };
  }
};

/**
 * Anonimizuje dane osobowe, zastępując część znaków gwiazdkami
 * @param {string} data - Dane do anonimizacji
 * @param {number} visibleChars - Liczba widocznych znaków na początku i końcu
 * @returns {string} - Zanonimizowane dane
 */
export const anonymizeData = (data: string, visibleChars: number = 2): string => {
  if (!data || data.length <= visibleChars * 2) return data;
  
  const prefix = data.substring(0, visibleChars);
  const suffix = data.substring(data.length - visibleChars);
  const middle = '*'.repeat(data.length - visibleChars * 2);
  
  return prefix + middle + suffix;
};

/**
 * Pseudonimizuje dane osobowe, generując unikalny identyfikator
 * @param {string} data - Dane do pseudonimizacji
 * @returns {string} - Pseudonimizowane dane
 */
export const pseudonymizeData = (data: string): string => {
  if (!data) return '';
  
  // Generowanie pseudonimu na podstawie skrótu SHA-256
  const hash = CryptoJS.SHA256(data).toString();
  return hash.substring(0, 16); // Zwracamy pierwsze 16 znaków hasha
};

/**
 * Generuje losowy token
 * @param {number} length - Długość tokenu
 * @returns {string} - Wygenerowany token
 */
export const generateToken = (length: number = 32): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }
  
  return token;
};

/**
 * Wykrywa potencjalne naruszenia bezpieczeństwa w danych wejściowych
 * @param {string} input - Dane wejściowe
 * @returns {boolean} - Czy wykryto potencjalne naruszenie
 */
export const detectSecurityBreach = (input: string): boolean => {
  if (!input) return false;
  
  // Wykrywanie potencjalnych ataków XSS
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+=/gi
  ];
  
  // Wykrywanie potencjalnych ataków SQL Injection
  const sqlInjectionPatterns = [
    /'\s*OR\s*'1'='1/gi,
    /'\s*OR\s*1=1/gi,
    /--/g,
    /;\s*DROP\s+TABLE/gi
  ];
  
  // Sprawdzenie wzorców XSS
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) return true;
  }
  
  // Sprawdzenie wzorców SQL Injection
  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(input)) return true;
  }
  
  return false;
};
