// WebSocket service for real-time location tracking

export interface LocationUpdate {
  employeeId: string;
  busId: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  busNumber: string;
}

export interface WebSocketMessage {
  type: 'location_update' | 'admin_connected' | 'employee_connected' | 'error';
  data: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;
  private employeeId: string | null = null;
  private busId: string | null = null;
  private eventListeners: { [key: string]: Function[] } = {};

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Initialize event listeners
  }

  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  private emit(event: string, data?: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  connect(employeeId: string, busId: string) {
    this.employeeId = employeeId;
    this.busId = busId;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.emit('error', error);
    }
  }

  private setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connection established');
      this.isConnected = true;
      this.emit('connected');
      
      // Send employee connection message
      this.sendMessage({
        type: 'employee_connected',
        data: {
          employeeId: this.employeeId,
          busId: this.busId,
          role: 'employee'
        }
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      this.isConnected = false;
      this.emit('disconnected');
      this.handleReconnection();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'admin_connected':
        console.log('Admin connected to WebSocket');
        break;
      case 'error':
        console.error('Server error:', message.data);
        break;
      default:
        console.log('Received message:', message);
    }
  }

  sendLocationUpdate(location: { lat: number; lng: number }, busNumber: string, accuracy?: number) {
    if (!this.isConnected || !this.employeeId || !this.busId) {
      console.warn('WebSocket not connected or missing employee/bus data');
      return;
    }

    const locationUpdate: LocationUpdate = {
      employeeId: this.employeeId,
      busId: this.busId,
      location,
      timestamp: new Date().toISOString(),
      busNumber,
      accuracy
    };

    this.sendMessage({
      type: 'location_update',
      data: locationUpdate
    });
  }

  sendDeviceLocation(location: { lat: number; lng: number }, deviceInfo: any, accuracy?: number, speed?: number, heading?: number) {
    if (!this.isConnected || !this.employeeId || !this.busId) {
      console.warn('WebSocket not connected or missing employee/bus data');
      return;
    }

    const deviceLocation = {
      employeeId: this.employeeId,
      busId: this.busId,
      location,
      deviceInfo,
      accuracy,
      speed,
      heading,
      timestamp: new Date().toISOString()
    };

    this.sendMessage({
      type: 'device_location',
      data: deviceLocation
    });
  }

  private sendMessage(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not ready, message not sent:', message);
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.employeeId && this.busId) {
          this.connect(this.employeeId, this.busId);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('error', new Error('Max reconnection attempts reached'));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.employeeId = null;
    this.busId = null;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

export const websocketService = new WebSocketService();
