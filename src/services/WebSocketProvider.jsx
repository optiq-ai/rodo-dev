import React, { useEffect } from 'react';
import WebSocketService from './websocket.service';
import { useSnackbar } from 'notistack';

const WebSocketProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Get WebSocket URL based on current environment
  const getWebSocketUrl = () => {
    // Get the current hostname
    const hostname = window.location.hostname;
    
    // Check if we're running in production (on the actual domain)
    if (hostname === 'rodo.optiq-ai.pl') {
      // For production domain, use the same origin without port specification
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${hostname}/ws`;
    }
    
    // For any other domain (including IP addresses), use that domain with the backend port
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${hostname}:3011/ws`;
    }
    
    // Default to localhost for local development
    return process.env.REACT_APP_WS_URL || 'ws://localhost:3011/ws';
  };
  
  const wsUrl = getWebSocketUrl();

  useEffect(() => {
    // Log the WebSocket URL being used
    console.log('WebSocket connecting to:', wsUrl);
    console.log('Current hostname:', window.location.hostname);
    console.log('Current origin:', window.location.origin);
    
    // Connect to WebSocket server
    WebSocketService.connect(wsUrl);

    // Register connection callback
    const unsubscribeConnection = WebSocketService.onConnectionChange((connected) => {
      if (connected) {
        enqueueSnackbar('Connected to real-time updates', { variant: 'success' });
      } else {
        enqueueSnackbar('Disconnected from real-time updates. Reconnecting...', { variant: 'warning' });
      }
    });

    // Register message callback for connection messages
    const unsubscribeMessage = WebSocketService.onMessage('connection', (data) => {
      console.log('Connection message:', data);
    });

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      WebSocketService.send({ type: 'ping', timestamp: new Date().toISOString() });
    }, 30000);

    // Cleanup on unmount
    return () => {
      unsubscribeConnection();
      unsubscribeMessage();
      clearInterval(pingInterval);
      WebSocketService.disconnect();
    };
  }, [wsUrl, enqueueSnackbar]);

  return <>{children}</>;
};

export default WebSocketProvider;
