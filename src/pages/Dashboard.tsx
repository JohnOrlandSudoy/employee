import React, { useState, useEffect } from 'react';
import { Bell, Plus, Minus, AlertTriangle, LogOut, Bus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { MapComponent } from '../components/Map';
import { NotificationModal } from '../components/NotificationModal';
import { ReportModal } from '../components/ReportModal';
import { Bus as BusType, Notification } from '../types';

export const Dashboard: React.FC = () => {
  const { employee, logout } = useAuth();
  const [bus, setBus] = useState<BusType | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadBusData();
    loadNotifications();
    // Start location tracking after bus data is loaded in loadBusData

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const loadBusData = async () => {
    if (!employee) return;

    try {
      console.log('Loading bus data for employee:', employee.email);
      const busData = await apiClient.getMyBus(employee.email);
      console.log('Received bus data:', busData);
      console.log('Bus ID for reports:', busData.id);
      console.log('Seats calculation:', {
        total_seats: busData.total_seats,
        available_seats: busData.available_seats,
        passengers: busData.total_seats - busData.available_seats
      });
      setBus(busData);
      
      // Start location tracking after bus data is loaded
      if (busData.id && employee.id) {
        startLocationTracking();
      }
    } catch (error) {
      console.error('Failed to load bus data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const notificationsData = await apiClient.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const startLocationTracking = () => {
    console.log('📍 Starting location tracking...');
    console.log('📍 Current bus data:', bus);
    
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    if (!bus) {
      console.warn('⚠️ Bus data not available yet, waiting...');
      // Retry in 2 seconds
      setTimeout(() => {
        console.log('🔄 Retrying location tracking...');
        startLocationTracking();
      }, 2000);
      return;
    }

    console.log('✅ Starting GPS tracking...');
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        setCurrentLocation([latitude, longitude]);
        
        // Send location to backend via API
        try {
          if (employee && bus) {
            await apiClient.updateLocation(latitude, longitude, employee.id, bus.id);
          } else {
            await apiClient.updateLocation(latitude, longitude);
          }
        } catch (error) {
          console.error('Failed to update location via API:', error);
        }
        
        console.log('📍 Location sent:', {
          lat: latitude,
          lng: longitude,
          accuracy: `${accuracy} meters`,
          speed: speed ? `${speed} m/s` : 'N/A',
          heading: heading ? `${heading}°` : 'N/A'
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // Reduced to 30 seconds for more frequent updates
      }
    );

    setWatchId(id);
  };

  const updatePassengerCount = async (action: 'add' | 'remove') => {
    if (!bus) return;

    try {
      await apiClient.updatePassengerCount(bus.id, action);
      // Reload bus data to get updated passenger count
      await loadBusData();
    } catch (error) {
      console.error('Failed to update passenger count:', error);
    }
  };

  const handleSubmitReport = async (report: { type: Report['type']; description: string }) => {
    if (!employee || !bus) {
      console.error('Employee or bus data not available');
      return;
    }

    try {
      console.log('Employee data:', {
        id: employee.id,
        email: employee.email,
        assignedBusId: employee.assignedBusId
      });
      console.log('Bus data:', {
        id: bus.id,
        bus_number: bus.bus_number
      });
      console.log('Submitting report with data:', {
        employeeId: employee.id,
        busId: bus.id,
        type: report.type,
        description: report.description
      });
      
      await apiClient.submitReport(
        employee.id,
        bus.id,
        report.type as 'maintenance' | 'traffic' | 'passenger' | 'other',
        report.description
      );
      setSuccessMessage('Report submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw error;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-rose-500 rounded-full flex items-center justify-center">
                <Bus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Bus Tracking</h1>
                <p className="text-sm text-gray-600">Welcome, {employee?.profile?.fullName || employee?.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Live status removed (WebSocket disabled) */}

              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-rose-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Route Map</h2>
              <MapComponent bus={bus} currentLocation={currentLocation} />
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            {/* Bus Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-rose-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bus Information</h3>
              {bus ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bus Number:</span>
                    <span className="font-medium">{bus.bus_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-medium">{bus.route?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Terminal:</span>
                    <span className="font-medium">{(bus as any).route?.start_terminal_id || bus.route?.start_terminal_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Terminal:</span>
                    <span className="font-medium">{(bus as any).route?.end_terminal_id || bus.route?.end_terminal_id || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No bus assigned</p>
              )}
            </div>

            {/* Passenger Counter */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-rose-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Passenger Count</h3>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => updatePassengerCount('remove')}
                  disabled={!bus || bus.available_seats >= bus.total_seats}
                  className="p-3 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {bus ? Math.max(0, bus.total_seats - bus.available_seats) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Passengers</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {bus?.available_seats || 0} seats available
                  </div>
                </div>

                <button
                  onClick={() => updatePassengerCount('add')}
                  disabled={!bus || bus.available_seats <= 0}
                  className="p-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-rose-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full bg-rose-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-rose-600 transition-colors flex items-center justify-center space-x-2"
              >
                <AlertTriangle className="h-5 w-5" />
                <span>Report Issue</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
};