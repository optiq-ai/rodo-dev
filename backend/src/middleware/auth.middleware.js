const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');
const logger = require('../utils/logger');

// UWAGA: Autoryzacja została tymczasowo wyłączona!
// Wszystkie middleware przepuszczają żądania bez sprawdzania uwierzytelniania

// Authentication middleware - tymczasowo wyłączone
exports.authenticate = async (req, res, next) => {
  // Tworzymy fikcyjnego użytkownika admin z pełnymi uprawnieniami
  try {
    // Symulujemy zalogowanego użytkownika admin
    const adminUser = {
      id: '00000000-0000-0000-0000-000000000000',
      username: 'admin',
      email: 'admin@rodo.example.com',
      role: 'admin',
      status: 'active',
      Role: {
        name: 'admin',
        Permissions: [
          { resource: '*', action: '*' }
        ]
      },
      permissions: ['*:*']
    };
    
    // Dodajemy fikcyjnego użytkownika do żądania
    req.user = adminUser;
    
    logger.info('Autoryzacja wyłączona - używamy fikcyjnego konta admin');
    next();
  } catch (error) {
    logger.error('Błąd w wyłączonym middleware uwierzytelniania:', error);
    next();
  }
};

// Authorization middleware - tymczasowo wyłączone
exports.authorize = (requiredRole) => {
  return (req, res, next) => {
    // Przepuszczamy wszystkie żądania bez sprawdzania roli
    logger.info('Autoryzacja wyłączona - pomijamy sprawdzanie roli');
    next();
  };
};

// Permission-based authorization middleware - tymczasowo wyłączone
exports.hasPermission = (resource, action) => {
  return (req, res, next) => {
    // Przepuszczamy wszystkie żądania bez sprawdzania uprawnień
    logger.info(`Autoryzacja wyłączona - pomijamy sprawdzanie uprawnień ${resource}:${action}`);
    next();
  };
};
