import { useState, useEffect, useRef, useCallback } from 'react';
import { GEOLOCATION_CONFIG, GEOCODING_CONFIG } from '../constants/map';

interface LocationData {
  lat: number;
  lng: number;
  timestamp: string;
  accuracy?: number;
  speed?: number;
}

interface PlaceInfo {
  city?: string;
  barangay?: string;
  country?: string;
  display?: string;
}

interface UseLocationTrackingReturn {
  realTimeLocation: [number, number] | null;
  locationAccuracy: number | null;
  locationTimestamp: string | null;
  isTracking: boolean;
  locationHistory: LocationData[];
  placeInfo: PlaceInfo;
  geoPermission: 'granted' | 'prompt' | 'denied' | 'unknown';
  getCurrentLocation: () => Promise<void>;
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => void;
  clearLocationHistory: () => void;
}

export const useLocationTracking = (): UseLocationTrackingReturn => {
  const [realTimeLocation, setRealTimeLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationTimestamp, setLocationTimestamp] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo>({});
  const [geoPermission, setGeoPermission] = useState<'granted' | 'prompt' | 'denied' | 'unknown'>('unknown');
  
  const geocodeTimer = useRef<number | null>(null);
  const permissionCheckedRef = useRef(false);
  const watchIdRef = useRef<number | null>(null);

  // Reverse geocode coordinates to human-readable place
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const googleKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
      if (googleKey) {
        const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleKey}`;
        const gRes = await fetch(gUrl);
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.status === 'OK' && gData.results?.length) {
            const comp = gData.results[0].address_components || [];
            const get = (type: string) => comp.find((c: any) => c.types.includes(type))?.long_name;
            const barangay = get('sublocality_level_1') || get('neighborhood') || get('sublocality') || get('locality');
            const city = get('locality') || get('administrative_area_level_2') || get('administrative_area_level_1');
            const country = get('country');
            setPlaceInfo({ city, barangay, country, display: gData.results[0].formatted_address });
            return;
          }
        }
      }
      
      // Fallback to Nominatim
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) return;
      const data = await resp.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.municipality || addr.state_district || addr.county;
      const barangay = addr.barangay || addr.suburb || addr.village || addr.neighbourhood || addr.quarter;
      const country = addr.country || (addr.country_code ? String(addr.country_code).toUpperCase() : undefined);
      setPlaceInfo({ city, barangay, country, display: data.display_name });
    } catch (error) {
      console.warn('Geocoding failed:', error);
    }
  }, []);

  // Update location data
  const updateLocation = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    const newLocation: [number, number] = [latitude, longitude];
    const now = new Date();
    
    // Calculate speed based on previous location
    let speed = 0;
    if (locationHistory.length > 0) {
      const prevLocation = locationHistory[0];
      const timeDiff = now.getTime() - new Date(prevLocation.timestamp).getTime();
      if (timeDiff > 0) {
        const distance = Math.sqrt(
          Math.pow(latitude - prevLocation.lat, 2) + Math.pow(longitude - prevLocation.lng, 2)
        ) * 111000; // Convert to meters (rough conversion)
        speed = distance / (timeDiff / 1000); // m/s
      }
    }
    
    setRealTimeLocation(newLocation);
    setLocationAccuracy(accuracy);
    setLocationTimestamp(now.toLocaleTimeString());
    
    // Add to location history with ISO timestamp and speed
    setLocationHistory(prev => [
      { 
        lat: latitude, 
        lng: longitude, 
        timestamp: now.toISOString(), 
        accuracy,
        speed 
      },
      ...prev.slice(0, 9) // Keep last 10 locations
    ]);
    
    // Trigger reverse geocoding
    if (geocodeTimer.current) {
      clearTimeout(geocodeTimer.current);
    }
    geocodeTimer.current = window.setTimeout(() => {
      reverseGeocode(latitude, longitude);
    }, GEOCODING_CONFIG.debounceDelay);
    
    console.log('📍 Location update:', { lat: latitude, lng: longitude, accuracy, speed });
  }, [reverseGeocode, locationHistory]);

  // Get current device location
  const getCurrentLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    return new Promise((resolve, reject) => {
      setIsTracking(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation(position);
          resolve();
        },
        (error) => {
          console.warn('Location error:', error);
          setIsTracking(false);
          reject(new Error(`Failed to get location: ${error.message}`));
        },
        GEOLOCATION_CONFIG
      );
    });
  }, [updateLocation]);

  // Start continuous location tracking
  const startLocationTracking = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    return new Promise((resolve, reject) => {
      setIsTracking(true);
      
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          updateLocation(position);
          resolve();
        },
        (error) => {
          console.error('Location tracking error:', error);
          setIsTracking(false);
          reject(new Error(`Location tracking failed: ${error.message}`));
        },
        GEOLOCATION_CONFIG
      );
    });
  }, [updateLocation]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setRealTimeLocation(null);
    setLocationAccuracy(null);
    setLocationTimestamp(null);
  }, []);

  // Clear location history
  const clearLocationHistory = useCallback(() => {
    setLocationHistory([]);
  }, []);

  // Check geolocation permission on mount
  useEffect(() => {
    if (permissionCheckedRef.current) return;
    permissionCheckedRef.current = true;
    
    if (!navigator.geolocation) return;
    
    try {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((status: any) => {
          setGeoPermission(status.state);
          status.onchange = () => setGeoPermission(status.state);
          if (status.state === 'granted') {
            getCurrentLocation().catch(console.warn);
          } else if (status.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(() => {}, () => {}, {
              ...GEOLOCATION_CONFIG,
              timeout: 8000,
            });
          }
        }).catch(() => {
          navigator.geolocation.getCurrentPosition(() => {}, () => {}, {
            ...GEOLOCATION_CONFIG,
            timeout: 8000,
          });
        });
      } else {
        navigator.geolocation.getCurrentPosition(() => {}, () => {}, {
          ...GEOLOCATION_CONFIG,
          timeout: 8000,
        });
      }
    } catch (error) {
      console.warn('Permission check failed:', error);
    }
  }, [getCurrentLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (geocodeTimer.current) {
        clearTimeout(geocodeTimer.current);
      }
    };
  }, []);

  return {
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
  };
};
