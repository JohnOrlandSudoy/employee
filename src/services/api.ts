import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Employee, Bus, Notification, Report, LoginResponse, BusResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;
  private trackingClient: AxiosInstance;

  constructor() {
    // Main backend server for auth, bus data, and reports
    this.client = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL || 'https://backendbus-sumt.onrender.com',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Bus tracking server for real-time location updates
    this.trackingClient = axios.create({
      baseURL: import.meta.env.VITE_TRACKING_URL || 'https://employee-server-89en.onrender.com',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests for main backend
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API: Request with token:', token.substring(0, 20) + '...');
      } else {
        console.log('API: No token found');
      }
      return config;
    });

    // Add auth token to requests for tracking server
    this.trackingClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Tracking API: Request with token:', token.substring(0, 20) + '...');
      } else {
        console.log('Tracking API: No token found');
      }
      return config;
    });

    // Handle auth errors for main backend
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('employee_data');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Handle auth errors for tracking server
    this.trackingClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('employee_data');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<Employee> {
    const response: AxiosResponse<LoginResponse> = await this.client.post('/api/auth/employee-login', {
      email,
      password,
    });
    
    // Extract employee data and add token
    const employeeData = response.data.employee;
    employeeData.token = response.data.session.access_token;
    
    return employeeData;
  }

  // Employee endpoints
  async getMyBus(email: string): Promise<Bus> {
    const response: AxiosResponse<BusResponse> = await this.client.get('/api/employee/my-bus', {
      params: { email },
    });
    return response.data.bus;
  }

  async updateLocation(lat: number, lng: number, employeeId?: string, busId?: string): Promise<void> {
    const payload: any = { lat, lng };
    
    // Add employee and bus info if available
    if (employeeId) payload.employeeId = employeeId;
    if (busId) payload.busId = busId;
    
    // Use tracking server for location updates
    await this.trackingClient.put('/api/employee/location', payload);
  }

  async updatePassengerCount(busId: string, action: 'add' | 'remove'): Promise<void> {
    await this.client.put(`/api/employee/passenger-count/${busId}`, { action });
  }

  async getNotifications(employeeId?: string): Promise<Notification[]> {
    const response: AxiosResponse<Notification[]> = await this.client.get('/api/employee/notifications', {
      params: employeeId ? { employeeId } : {},
    });
    return response.data;
  }

  // Map UI types to backend enum (maintenance, violation, delay)
  private mapReportTypeToServer(type: Report['type']): 'maintenance' | 'violation' | 'delay' {
    switch (type) {
      case 'maintenance':
        return 'maintenance';
      case 'traffic':
        return 'delay';
      case 'passenger':
        return 'violation';
      case 'other':
      default:
        return 'violation';
    }
  }

  async submitReport(employeeId: string, busId: string, type: Report['type'], description: string): Promise<void> {
    const payload = {
      employeeId,
      busId,
      type: this.mapReportTypeToServer(type),
      description: description?.trim(),
    };
    
    console.log('API: Submitting report with payload:', payload);
    
    try {
      const response = await this.client.post('/api/employee/report', payload);
      console.log('API: Report submitted successfully:', response.data);
    } catch (error: any) {
      const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
      console.log('API: Error response:', error?.response?.status, serverMsg, error?.response?.data);
      const err = new Error(serverMsg || 'Failed to submit report');
      // @ts-expect-error attach original
      err.cause = error;
      throw err;
    }
  }
}

export const apiClient = new ApiClient();