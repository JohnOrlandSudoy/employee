import React, { useEffect, useRef } from 'react';
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

// Custom bus icon
const busIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iOCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI0Y0M0Y1RSIvPgo8cmVjdCB4PSI2IiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iMiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMTAiIGN5PSIyNiIgcj0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8Y2lyY2xlIGN4PSIyMiIgY3k9IjI2IiByPSIyIiBmaWxsPSIjMzc0MTUxIi8+Cjwvc3ZnPgo=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Terminal icon
const terminalIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxMDU5MkIiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMTIgMnYyMG0tMTAtOGgxMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo=',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
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

  const center: LatLngExpression = currentLocation || 
    (bus?.current_location ? [bus.current_location.lat, bus.current_location.lng] : [40.7128, -74.0060]);

  // Since the API doesn't return full terminal objects, we'll use the IDs for now
  // You might need to fetch terminal details separately or modify your backend
  const routePath: Array<[number, number]> = [];
  const startTerminal = null; // bus?.route?.start_terminal;
  const endTerminal = null; // bus?.route?.end_terminal;

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg border border-rose-100" style={{ zIndex: 1 }}>
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

        {/* Bus location */}
        {(currentLocation || bus?.current_location) && (
          <Marker 
            position={currentLocation || [bus!.current_location!.lat, bus!.current_location!.lng]} 
            icon={busIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">Bus {bus?.bus_number}</h3>
                <p className="text-sm text-gray-600">Current Location</p>
                <p className="text-xs text-gray-500 mt-1">
                  Available Seats: {bus?.available_seats || 0}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};