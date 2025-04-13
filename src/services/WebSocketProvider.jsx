import React, { useEffect } from 'react';
import WebSocketService from './websocket.service';
import { useSnackbar } from 'notistack';

const WebSocketProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const wsUrl = process.env.REACT_APP_WS_URL || `ws://${window.location.hostname}:3011/ws`;

  useEffect(() => {
    // Log the WebSocket URL being used
    console.log('WebSocket connecting to:', wsUrl);
    
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
