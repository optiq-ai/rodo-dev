import React, { useEffect, useRef, useState } from 'react';

// WebSocket service for real-time communication
const WebSocketService = {
  socket: null,
  messageCallbacks: {},
  connectionCallbacks: [],
  
  // Connect to WebSocket server
  connect: (url) => {
    if (WebSocketService.socket) {
      WebSocketService.socket.close();
    }
    
    // Create WebSocket connection
    WebSocketService.socket = new WebSocket(url);
    
    // Connection opened
    WebSocketService.socket.addEventListener('open', (event) => {
      console.log('WebSocket connection established');
      WebSocketService.connectionCallbacks.forEach(callback => callback(true));
    });
    
    // Connection closed
    WebSocketService.socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed');
      WebSocketService.connectionCallbacks.forEach(callback => callback(false));
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        WebSocketService.connect(url);
      }, 5000);
    });
    
    // Listen for messages
    WebSocketService.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        const type = data.type;
        
        // Call registered callbacks for this message type
        if (WebSocketService.messageCallbacks[type]) {
          WebSocketService.messageCallbacks[type].forEach(callback => callback(data));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle errors
    WebSocketService.socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
    });
  },
  
  // Send message to server
  send: (message) => {
    if (WebSocketService.socket && WebSocketService.socket.readyState === WebSocket.OPEN) {
      WebSocketService.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  },
  
  // Register callback for specific message type
  onMessage: (type, callback) => {
    if (!WebSocketService.messageCallbacks[type]) {
      WebSocketService.messageCallbacks[type] = [];
    }
    WebSocketService.messageCallbacks[type].push(callback);
    
    // Return unsubscribe function
    return () => {
      WebSocketService.messageCallbacks[type] = WebSocketService.messageCallbacks[type].filter(cb => cb !== callback);
    };
  },
  
  // Register callback for connection status changes
  onConnectionChange: (callback) => {
    WebSocketService.connectionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      WebSocketService.connectionCallbacks = WebSocketService.connectionCallbacks.filter(cb => cb !== callback);
    };
  },
  
  // Disconnect from server
  disconnect: () => {
    if (WebSocketService.socket) {
      WebSocketService.socket.close();
      WebSocketService.socket = null;
    }
  }
};

// React hook for using WebSocket
export const useWebSocket = (url) => {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  
  useEffect(() => {
    // Connect to WebSocket server
    WebSocketService.connect(url);
    
    // Register connection callback
    const unsubscribeConnection = WebSocketService.onConnectionChange(setConnected);
    
    // Register message callback for all messages
    const unsubscribeMessage = WebSocketService.onMessage('*', setLastMessage);
    
    // Cleanup on unmount
    return () => {
      unsubscribeConnection();
      unsubscribeMessage();
    };
  }, [url]);
  
  // Return WebSocket state and methods
  return {
    connected,
    lastMessage,
    send: WebSocketService.send,
    onMessage: WebSocketService.onMessage
  };
};

export default WebSocketService;
