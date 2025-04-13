const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');
const { sequelize, connectToDatabase } = require('./config/database');
const logger = require('./utils/logger');
const routes = require('./routes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3011;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  logger.info('Client connected to WebSocket');
  
  // Send initial message
  ws.send(JSON.stringify({ type: 'connection', message: 'Connected to RODO WebSocket server' }));
  
  // Handle messages from client
  ws.on('message', (message) => {
    logger.info(`Received WebSocket message: ${message}`);
    try {
      const data = JSON.parse(message);
      // Handle different message types
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      logger.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });
  
  // Handle connection close
  ws.on('close', () => {
    logger.info('Client disconnected from WebSocket');
  });
});

// COMPLETELY DISABLE CORS - EMERGENCY ACCESS MODE
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Disable all security restrictions
app.use((req, res, next) => {
  // Basic headers only
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-XSS-Protection');
  next();
});

app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(morgan('combined', { stream: logger.stream })); // HTTP request logging

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'documents'), { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/v1', routes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to RODO API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'server_error',
      message: err.message || 'Internal Server Error',
      details: err.details || {}
    }
  });
});

// Function to initialize database and create default data
const initializeDatabase = async () => {
  try {
    // Sync all models with the database
    await sequelize.sync({ alter: true });
    logger.info('Database tables synchronized successfully');
    
    // After database is synced, import models and seed data
    // This avoids circular dependencies by importing models only after sync
    const models = require('./models');
    const { createDefaultUsers } = require('./config/seedData');
    
    // Initialize database with default users - pass sequelize and models as parameters
    await createDefaultUsers(sequelize, models);
    logger.info('Database initialization completed');
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    return false;
  }
};

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await connectToDatabase();
    if (!dbConnected) {
      logger.error('Failed to connect to the database. Server will not start.');
      process.exit(1);
    }
    
    // Initialize database and create default data
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      logger.error('Failed to initialize database. Server will start but may have limited functionality.');
    }
    
    // Start the server
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`WebSocket server is running on ws://localhost:${PORT}/ws`);
      logger.info('⚠️ EMERGENCY MODE: CORS and security restrictions completely disabled ⚠️');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export for testing
module.exports = { app, server, startServer };

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
