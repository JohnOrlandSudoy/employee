import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import { Bus } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon (from public/bus-icon.png)
const busIcon = new Icon({
  iconUrl: '/bus-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Terminal icon
const terminalIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxMDU5MkIiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMTIgMnYyMG0tMTAtOGgxMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo=',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// Current location bus icon (larger and more prominent)
const currentLocationBusIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNSIgeT0iMTAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIyMCIgcng9IjUiIGZpbGw9IiMxMEFBNjQiLz4KPHJlY3QgeD0iOCIgeT0iMTMiIHdpZHRoPSIyNCIgaGVpZ2h0PSIxNCIgcng9IjMiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjEzIiBjeT0iMzMiIHI9IjMiIGZpbGw9IiMzNzQxNTEiLz4KPGNpcmNsZSBjeD0iMjciIGN5PSIzMyIgcj0iMyIgZmlsbD0iIzM3NDE1MSIvPgo8L3N2Zz4K',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface MapProps {
  bus: Bus | null;
  currentLocation: [number, number] | null;
}

const MapUpdater: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);

  return null;
};

export const MapComponent: React.FC<MapProps> = ({ bus, currentLocation }) => {
  const mapRef = useRef<any>(null);
  const [realTimeLocation, setRealTimeLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationTimestamp, setLocationTimestamp] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState<Array<{lat: number, lng: number, timestamp: string}>>([]);
  const [placeInfo, setPlaceInfo] = useState<{ city?: string; barangay?: string; country?: string; display?: string }>({});
  const geocodeTimer = useRef<number | null>(null);
  const [geoPermission, setGeoPermission] = useState<'granted' | 'prompt' | 'denied' | 'unknown'>('unknown');
  const permissionCheckedRef = useRef(false);

  const center: LatLngExpression = realTimeLocation || currentLocation || 
    (bus?.current_location ? [bus.current_location.lat, bus.current_location.lng] : [14.6760, 121.0437]);

  // Since the API doesn't return full terminal objects, we'll use the IDs for now
  // You might need to fetch terminal details separately or modify your backend
  const routePath: Array<[number, number]> = [];
  const startTerminal: any = null; // bus?.route?.start_terminal;
  const endTerminal: any = null; // bus?.route?.end_terminal;

  // Get current device location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsTracking(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];
        
        setRealTimeLocation(newLocation);
        setLocationAccuracy(accuracy);
        setLocationTimestamp(new Date().toLocaleTimeString());
        
        // Add to location history
        setLocationHistory(prev => [
          { lat: latitude, lng: longitude, timestamp: new Date().toISOString() },
          ...prev.slice(0, 9) // Keep last 10 locations
        ]);
        
        console.log('📍 Current location:', { lat: latitude, lng: longitude, accuracy });
      },
      (error) => {
        console.warn('Location error (suppressed alert):', error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Prompt for geolocation permission on mount and attempt one-time fetch to trigger browser prompt
  useEffect(() => {
    if (permissionCheckedRef.current) return;
    permissionCheckedRef.current = true;
    if (!navigator.geolocation) return;
    try {
      // @ts-ignore - Permissions API types vary across browsers
      if (navigator.permissions && navigator.permissions.query) {
        // @ts-ignore
        navigator.permissions.query({ name: 'geolocation' }).then((status: any) => {
          setGeoPermission(status.state as any);
          status.onchange = () => setGeoPermission(status.state as any);
          if (status.state === 'granted') {
            getCurrentLocation();
          } else if (status.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(() => {}, () => {}, {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 0
            });
          }
        }).catch(() => {
          navigator.geolocation.getCurrentPosition(() => {}, () => {}, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
          });
        });
      } else {
        navigator.geolocation.getCurrentPosition(() => {}, () => {}, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Reverse geocode current coordinates to human-readable place
  useEffect(() => {
    const coords: [number, number] | null = realTimeLocation || currentLocation || (bus?.current_location ? [bus.current_location.lat, bus.current_location.lng] : null);
    if (!coords) return;

    const [lat, lng] = coords;

    if (geocodeTimer.current) {
      clearTimeout(geocodeTimer.current);
    }

    geocodeTimer.current = window.setTimeout(async () => {
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
      } catch (_e) {
        // ignore geocode errors
      }
    }, 800);

    return () => {
      if (geocodeTimer.current) {
        clearTimeout(geocodeTimer.current);
      }
    };
  }, [realTimeLocation, currentLocation, bus?.current_location?.lat, bus?.current_location?.lng]);

  // Start continuous location tracking
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsTracking(true);
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];
        
        setRealTimeLocation(newLocation);
        setLocationAccuracy(accuracy);
        setLocationTimestamp(new Date().toLocaleTimeString());
        
        // Add to location history
        setLocationHistory(prev => [
          { lat: latitude, lng: longitude, timestamp: new Date().toISOString() },
          ...prev.slice(0, 9) // Keep last 10 locations
        ]);
        
        console.log('📍 Location update:', { lat: latitude, lng: longitude, accuracy });
      },
      (error) => {
        console.error('Location tracking error:', error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Store watch ID for cleanup
    return () => navigator.geolocation.clearWatch(watchId);
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    setIsTracking(false);
    setRealTimeLocation(null);
    setLocationAccuracy(null);
    setLocationTimestamp(null);
  };

  // Clear location history
  const clearLocationHistory = () => {
    setLocationHistory([]);
  };

  // Create enhanced popup content for bus location
  const createBusPopupContent = () => {
    if (!bus) return 'No bus information available';
    
    return `
      <div class="text-center p-2">
        <h3 class="font-semibold text-gray-900 text-lg mb-2">🚌 Bus ${bus.bus_number}</h3>
        <div class="space-y-2 text-sm">
          ${placeInfo.city || placeInfo.barangay || placeInfo.country ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Area:</span>
              <span class="font-medium">${[placeInfo.barangay, placeInfo.city, placeInfo.country].filter(Boolean).join(', ')}</span>
            </div>
          ` : ''}
          ${bus.route?.start_terminal_id || bus.route?.name ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Start Terminal:</span>
              <span class="font-medium">${(bus as any).route?.terminal_id || bus.route?.name || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">End Terminal:</span>
              <span class="font-medium">${(bus as any).route?.terminal_id || bus.route?.name || 'N/A'}</span>
            </div>
          ` : ''}
          <div class="flex justify-between">
            <span class="text-gray-600">Route:</span>
            <span class="font-medium">${bus.route?.name || 'N/A'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Status:</span>
            <span class="font-medium text-green-600">${bus.status || 'N/A'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Total Seats:</span>
            <span class="font-medium">${bus.total_seats || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Available:</span>
            <span class="font-medium text-blue-600">${bus.available_seats || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Passengers:</span>
            <span class="font-medium text-orange-600">${(bus.total_seats || 0) - (bus.available_seats || 0)}</span>
          </div>
          ${realTimeLocation ? `
            <div class="mt-3 pt-2 border-t border-gray-200">
              <div class="text-xs text-gray-500">📍 Real-time GPS Location</div>
              <div class="text-xs text-gray-600">Lat: ${realTimeLocation[0].toFixed(6)}</div>
              <div class="text-xs text-gray-600">Lng: ${realTimeLocation[1].toFixed(6)}</div>
              ${locationAccuracy ? `<div class="text-xs text-gray-600">Accuracy: ${locationAccuracy.toFixed(1)}m</div>` : ''}
              ${locationTimestamp ? `<div class="text-xs text-gray-600">Updated: ${locationTimestamp}</div>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg border border-rose-100 relative" style={{ zIndex: 1 }}>
      {/* Real-time Status Indicator removed (WebSocket disabled) */}

      {/* Location Controls */}
      <div className="absolute top-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
        <div className="flex flex-col space-y-2">
          <button
            onClick={getCurrentLocation}
            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
          >
            📍 Get Location
          </button>
          <button
            onClick={isTracking ? stopLocationTracking : startLocationTracking}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              isTracking 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isTracking ? '⏹️ Stop' : '▶️ Track'}
          </button>
          <button
            onClick={clearLocationHistory}
            className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Location Info */}
      {realTimeLocation && (
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200 max-w-xs">
          <div className="text-xs space-y-1">
            <div className="font-semibold text-gray-900">📍 Current Location</div>
            <div className="text-gray-600">
              <div>Lat: {realTimeLocation[0].toFixed(6)}</div>
              <div>Lng: {realTimeLocation[1].toFixed(6)}</div>
              {locationAccuracy && <div>Accuracy: {locationAccuracy.toFixed(1)}m</div>}
              {locationTimestamp && <div>Time: {locationTimestamp}</div>}
              {(placeInfo.city || placeInfo.barangay || placeInfo.country) && (
                <div>Place: {[placeInfo.barangay, placeInfo.city, placeInfo.country].filter(Boolean).join(', ')}</div>
              )}
              {placeInfo.display && (
                <div className="mt-1">Address: {placeInfo.display}</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={center} />

        {/* Route polyline */}
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color="#F43F5E"
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Start terminal */}
        {startTerminal && (
          <Marker
            position={[startTerminal.location.lat, startTerminal.location.lng]}
            icon={terminalIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">{startTerminal.name}</h3>
                <p className="text-sm text-gray-600">Start Terminal</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* End terminal */}
        {endTerminal && (
          <Marker
            position={[endTerminal.location.lat, endTerminal.location.lng]}
            icon={terminalIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">{endTerminal.name}</h3>
                <p className="text-sm text-gray-600">End Terminal</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Real-time device location with BUS ICON (highest priority) */}
        {realTimeLocation && (
          <Marker 
            position={realTimeLocation} 
            icon={currentLocationBusIcon}
          >
            <Popup>
              <div dangerouslySetInnerHTML={{ __html: createBusPopupContent() }} />
            </Popup>
          </Marker>
        )}

        {/* Bus location from API (fallback when no real-time location) */}
        {(currentLocation || bus?.current_location) && !realTimeLocation && (
          <Marker 
            position={currentLocation || [bus!.current_location!.lat, bus!.current_location!.lng]} 
            icon={busIcon}
          >
            <Popup>
              <div dangerouslySetInnerHTML={{ __html: createBusPopupContent() }} />
            </Popup>
          </Marker>
        )}

        {/* Location history trail */}
        {locationHistory.length > 1 && (
          <Polyline
            positions={locationHistory.map(loc => [loc.lat, loc.lng])}
            color="#10AA64"
            weight={3}
            opacity={0.6}
            dashArray="5, 5"
          />
        )}

        {/* Location history markers */}
        {locationHistory.slice(1).map((location, index) => (
          <Marker
            key={location.timestamp}
            position={[location.lat, location.lng]}
            icon={new Icon({
              iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQiIGZpbGw9IiMxMEFBNjQiIG9wYWNpdHk9IjAuNiIvPgo8L3N2Zz4K',
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            })}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 text-xs">📍 Location {locationHistory.length - index}</h3>
                <p className="text-xs text-gray-600">
                  {new Date(location.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};