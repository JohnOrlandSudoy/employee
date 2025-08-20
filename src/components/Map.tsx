import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { Bus } from '../types';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { LocationControls } from './LocationControls';
import { LocationInfo } from './LocationInfo';
import { MapMarkers } from './MapMarkers';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_TILE_CONFIG } from '../constants/map';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  bus: Bus | null;
  currentLocation: [number, number] | null;
}

// Interface for the location update payload
interface LocationUpdatePayload {
  busId: string;
  latest: {
    lat: number;
    lng: number;
    accuracy: number;
    speed: number;
    employeeId: string;
    timestamp: string;
  };
}

const MapUpdater: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();
  
  React.useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);

  return null;
};

export const MapComponent: React.FC<MapProps> = ({ bus, currentLocation }) => {
  const { showToast } = useToast();
  const { employee } = useAuth();
  const [isSendingUpdate, setIsSendingUpdate] = useState(false);
  
  // Use custom hook for location tracking
  const {
    realTimeLocation,
    locationAccuracy,
    locationTimestamp,
    isTracking,
    locationHistory,
    placeInfo,
    geoPermission,
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
    clearLocationHistory,
  } = useLocationTracking();

  // Rate limiting for API calls (max 1 call per 5 seconds)
  const lastApiCallRef = React.useRef<number>(0);
  const API_CALL_INTERVAL = 5000; // 5 seconds

  // Function to send location update to API
  const sendLocationUpdate = useCallback(async (lat: number, lng: number, accuracy: number) => {
    if (!bus?.id || !employee?.id) {
      console.warn('Missing bus ID or employee ID for location update');
      return;
    }

    // Validate location data
    if (isNaN(lat) || isNaN(lng) || isNaN(accuracy)) {
      console.warn('Invalid location data:', { lat, lng, accuracy });
      return;
    }

    // Check if location is within reasonable bounds (Singapore area)
    if (lat < 1.0 || lat > 1.5 || lng < 103.0 || lng > 104.5) {
      console.warn('Location out of reasonable bounds:', { lat, lng });
      return;
    }

    // Rate limiting check
    const now = Date.now();
    if (now - lastApiCallRef.current < API_CALL_INTERVAL) {
      console.log('📍 API call rate limited, skipping update');
      return;
    }

    try {
      setIsSendingUpdate(true);
      
      // Get speed from the latest location data
      const latestLocation = locationHistory[0];
      const speed = latestLocation?.speed || 0;

      const payload: LocationUpdatePayload = {
        busId: bus.id,
        latest: {
          lat,
          lng,
          accuracy,
          speed,
          employeeId: employee.id,
          timestamp: new Date().toISOString()
        }
      };

      console.log('📍 Sending location update:', payload);

      const response = await fetch('https://employee-server-89en.onrender.com/api/admin/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('📍 Location update sent successfully:', result);
      
      // Update last API call time
      lastApiCallRef.current = now;
      
      // Show success toast for first few updates, then reduce frequency
      if (locationHistory.length < 3) {
        showToast('Location update sent to server', 'success');
      }
    } catch (error) {
      console.error('Failed to send location update:', error);
      const message = error instanceof Error ? error.message : 'Failed to send location update';
      showToast(message, 'error');
    } finally {
      setIsSendingUpdate(false);
    }
  }, [bus?.id, employee?.id, locationHistory, showToast]);

  // Send location update whenever real-time location changes
  useEffect(() => {
    if (realTimeLocation && locationAccuracy && isTracking && bus?.id && employee?.id) {
      const [lat, lng] = realTimeLocation;
      sendLocationUpdate(lat, lng, locationAccuracy);
    }
  }, [realTimeLocation, locationAccuracy, isTracking, bus?.id, employee?.id, sendLocationUpdate]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Reset sending state on unmount
      setIsSendingUpdate(false);
    };
  }, []);

  // Memoize map center calculation
  const center: LatLngExpression = useMemo(() => {
    return realTimeLocation || currentLocation || 
      (bus?.current_location ? [bus.current_location.lat, bus.current_location.lng] : DEFAULT_MAP_CENTER);
  }, [realTimeLocation, currentLocation, bus?.current_location]);

  // Memoize location control handlers with error handling
  const handleGetLocation = useCallback(async () => {
    try {
      await getCurrentLocation();
      showToast('Location obtained successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get location';
      showToast(message, 'error');
    }
  }, [getCurrentLocation, showToast]);

  const handleToggleTracking = useCallback(async () => {
    try {
      if (isTracking) {
        stopLocationTracking();
        showToast('Location tracking stopped', 'info');
      } else {
        await startLocationTracking();
        showToast('Location tracking started', 'success');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle tracking';
      showToast(message, 'error');
    }
  }, [isTracking, startLocationTracking, stopLocationTracking, showToast]);

  const handleClearHistory = useCallback(() => {
    clearLocationHistory();
    showToast('Location history cleared', 'info');
  }, [clearLocationHistory, showToast]);

  // Memoize location info component
  const locationInfoComponent = useMemo(() => {
    if (!realTimeLocation) return null;
    
    return (
      <LocationInfo
        realTimeLocation={realTimeLocation}
        locationAccuracy={locationAccuracy}
        locationTimestamp={locationTimestamp}
        placeInfo={placeInfo}
      />
    );
  }, [realTimeLocation, locationAccuracy, locationTimestamp, placeInfo]);

  // Memoize location controls component
  const locationControlsComponent = useMemo(() => (
    <LocationControls
      isTracking={isTracking}
      onGetLocation={handleGetLocation}
      onToggleTracking={handleToggleTracking}
      onClearHistory={handleClearHistory}
    />
  ), [isTracking, handleGetLocation, handleToggleTracking, handleClearHistory]);

  // Memoize map markers component
  const mapMarkersComponent = useMemo(() => (
    <MapMarkers
      bus={bus}
      currentLocation={currentLocation}
      realTimeLocation={realTimeLocation}
      locationAccuracy={locationAccuracy}
      locationTimestamp={locationTimestamp}
      placeInfo={placeInfo}
      locationHistory={locationHistory}
    />
  ), [
    bus,
    currentLocation,
    realTimeLocation,
    locationAccuracy,
    locationTimestamp,
    placeInfo,
    locationHistory
  ]);

  return (
    <div className="w-full h-[60vh] md:h-[70vh] lg:h-[600px] rounded-xl overflow-hidden shadow-lg border border-rose-100 relative" style={{ zIndex: 1 }}>
      {/* Status Indicator */}
      <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200">
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="font-medium">
            {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
          </span>
          {isSendingUpdate && (
            <div className="flex items-center space-x-1 text-blue-600">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </div>
          )}
        </div>
        {isTracking && realTimeLocation && (
          <div className="text-xs text-gray-600 mt-1">
            Last update: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Location Controls */}
      {locationControlsComponent}

      {/* Location Info */}
      {locationInfoComponent}
      
      <MapContainer
        center={center}
        zoom={DEFAULT_MAP_ZOOM}
        className="w-full h-full"
      >
        <TileLayer
          attribution={MAP_TILE_CONFIG.attribution}
          url={MAP_TILE_CONFIG.url}
        />

        <MapUpdater center={center} />

        {/* Map Markers */}
        {mapMarkersComponent}
      </MapContainer>
    </div>
  );
};