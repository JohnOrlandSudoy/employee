import React, { useMemo } from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import { Bus } from '../types';
import { BusPopupContent } from './BusPopupContent';
import { useMapIcons } from '../hooks/useMapIcons';
import { ROUTE_POLYLINE_CONFIG, LOCATION_TRAIL_CONFIG } from '../constants/map';

interface PlaceInfo {
  city?: string;
  barangay?: string;
  country?: string;
  display?: string;
}

interface MapMarkersProps {
  bus: Bus | null;
  currentLocation: [number, number] | null;
  realTimeLocation: [number, number] | null;
  locationAccuracy: number | null;
  locationTimestamp: string | null;
  placeInfo: PlaceInfo;
  locationHistory: Array<{lat: number, lng: number, timestamp: string}>;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  bus,
  currentLocation,
  realTimeLocation,
  locationAccuracy,
  locationTimestamp,
  placeInfo,
  locationHistory,
}) => {
  const icons = useMapIcons();

  // Memoize route path calculation
  const routePath = useMemo(() => {
    // Since the API doesn't return full terminal objects, we'll use the IDs for now
    // You might need to fetch terminal details separately or modify your backend
    return [] as Array<[number, number]>;
  }, []);

  // Memoize location history positions
  const locationHistoryPositions = useMemo(() => {
    return locationHistory.map(loc => [loc.lat, loc.lng] as [number, number]);
  }, [locationHistory]);

  // Memoize bus position
  const busPosition = useMemo(() => {
    if (currentLocation) return currentLocation;
    if (bus?.current_location) {
      return [bus.current_location.lat, bus.current_location.lng] as [number, number];
    }
    return null;
  }, [currentLocation, bus?.current_location]);

  return (
    <>
      {/* Route polyline */}
      {routePath.length > 0 && (
        <Polyline
          positions={routePath}
          color={ROUTE_POLYLINE_CONFIG.color}
          weight={ROUTE_POLYLINE_CONFIG.weight}
          opacity={ROUTE_POLYLINE_CONFIG.opacity}
        />
      )}

      {/* Real-time device location with BUS ICON (highest priority) */}
      {realTimeLocation && (
        <Marker 
          position={realTimeLocation} 
          icon={icons.currentLocationBusIcon}
        >
          <Popup>
            <BusPopupContent
              bus={bus}
              placeInfo={placeInfo}
              realTimeLocation={realTimeLocation}
              locationAccuracy={locationAccuracy}
              locationTimestamp={locationTimestamp}
            />
          </Popup>
        </Marker>
      )}

      {/* Bus location from API (fallback when no real-time location) */}
      {busPosition && !realTimeLocation && (
        <Marker 
          position={busPosition} 
          icon={icons.busIcon}
        >
          <Popup>
            <BusPopupContent
              bus={bus}
              placeInfo={placeInfo}
              realTimeLocation={realTimeLocation}
              locationAccuracy={locationAccuracy}
              locationTimestamp={locationTimestamp}
            />
          </Popup>
        </Marker>
      )}

      {/* Location history trail */}
      {locationHistory.length > 1 && (
        <Polyline
          positions={locationHistoryPositions}
          color={LOCATION_TRAIL_CONFIG.color}
          weight={LOCATION_TRAIL_CONFIG.weight}
          opacity={LOCATION_TRAIL_CONFIG.opacity}
          dashArray={LOCATION_TRAIL_CONFIG.dashArray}
        />
      )}

      {/* Location history markers */}
      {locationHistory.slice(1).map((location, index) => (
        <Marker
          key={location.timestamp}
          position={[location.lat, location.lng]}
          icon={icons.locationHistoryIcon}
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
    </>
  );
};
