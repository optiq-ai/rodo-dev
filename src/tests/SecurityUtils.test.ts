import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../services/auth/AuthContext';
import { encryptData, decryptData, hashPassword, verifyPassword, sanitizeInput, validateEmail, validatePassword, anonymizeData, pseudonymizeData } from '../utils/securityUtils';

// Bezpośrednie testy funkcji bezpieczeństwa
describe('Security Utils', () => {
  test('encrypts and decrypts data correctly', () => {
    const testData = 'Test sensitive data';
    const encrypted = encryptData(testData);
    
    // Sprawdzenie, czy zaszyfrowane dane różnią się od oryginalnych
    expect(encrypted).not.toBe(testData);
    
    // Sprawdzenie, czy deszyfrowanie działa poprawnie
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(testData);
  });

  test('encrypts and decrypts object data correctly', () => {
    const testObject = { name: 'John Doe', email: 'john@example.com', sensitive: true };
    const encrypted = encryptData(testObject);
    
    // Sprawdzenie, czy zaszyfrowane dane różnią się od oryginalnych
    expect(encrypted).not.toEqual(JSON.stringify(testObject));
    
    // Sprawdzenie, czy deszyfrowanie i parsowanie działa poprawnie
    const decrypted = JSON.parse(decryptData(encrypted));
    expect(decrypted).toEqual(testObject);
  });

  test('hashes passwords correctly', () => {
    const password = 'SecurePassword123!';
    const hash = hashPassword(password);
    
    // Sprawdzenie, czy hash różni się od oryginalnego hasła
    expect(hash).not.toBe(password);
    
    // Sprawdzenie, czy weryfikacja hasła działa poprawnie
    expect(verifyPassword(password, hash)).toBe(true);
    expect(verifyPassword('WrongPassword', hash)).toBe(false);
  });

  test('sanitizes input correctly', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    
    // Sprawdzenie, czy niebezpieczne znaki zostały zastąpione
    expect(sanitized).not.toBe(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  test('validates email correctly', () => {
    // Poprawne adresy email
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user.name@example.co.uk')).toBe(true);
    
    // Niepoprawne adresy email
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user@example')).toBe(false);
    expect(validateEmail('userexample.com')).toBe(false);
  });

  test('validates password strength correctly', () => {
    // Słabe hasło
    const weakResult = validatePassword('weak');
    expect(weakResult.isValid).toBe(false);
    expect(weakResult.strength).toBe('weak');
    
    // Średnie hasło
    const mediumResult = validatePassword('Password123');
    expect(mediumResult.isValid).toBe(true);
    expect(mediumResult.strength).toBe('medium');
    
    // Silne hasło
    const strongResult = validatePassword('StrongP@ssw0rd');
    expect(strongResult.isValid).toBe(true);
    expect(strongResult.strength).toBe('strong');
  });

  test('anonymizes data correctly', () => {
    const email = 'john.doe@example.com';
    const anonymized = anonymizeData(email, 2);
    
    // Sprawdzenie, czy dane zostały zanonimizowane
    expect(anonymized).not.toBe(email);
    expect(anonymized.length).toBe(email.length);
    expect(anonymized.startsWith('jo')).toBe(true);
    expect(anonymized.endsWith('om')).toBe(true);
    expect(anonymized).toContain('*');
  });

  test('pseudonymizes data correctly', () => {
    const personalData = 'John Doe';
    const pseudonymized = pseudonymizeData(personalData);
    
    // Sprawdzenie, czy dane zostały pseudonimizowane
    expect(pseudonymized).not.toBe(personalData);
    expect(pseudonymized.length).toBe(16); // SHA-256 hash skrócony do 16 znaków
  });
});
