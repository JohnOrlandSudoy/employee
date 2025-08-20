import React from 'react';

interface PlaceInfo {
  city?: string;
  barangay?: string;
  country?: string;
  display?: string;
}

interface BusPopupContentProps {
  bus: any; // Using any for now, should be properly typed
  placeInfo: PlaceInfo;
  realTimeLocation: [number, number] | null;
  locationAccuracy: number | null;
  locationTimestamp: string | null;
}

export const BusPopupContent: React.FC<BusPopupContentProps> = ({
  bus,
  placeInfo,
  realTimeLocation,
  locationAccuracy,
  locationTimestamp,
}) => {
  if (!bus) return <div>No bus information available</div>;

  return (
    <div className="text-center p-2">
      <h3 className="font-semibold text-gray-900 text-lg mb-2">🚌 Bus {bus.bus_number}</h3>
      <div className="space-y-2 text-sm">
        {(placeInfo.city || placeInfo.barangay || placeInfo.country) && (
          <div className="flex justify-between">
            <span className="text-gray-600">Area:</span>
            <span className="font-medium">
              {[placeInfo.barangay, placeInfo.city, placeInfo.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        
        {(bus.route?.start_terminal_id || bus.route?.name) && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Start Terminal:</span>
              <span className="font-medium">
                {(bus as any).route?.terminal_id || bus.route?.name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">End Terminal:</span>
              <span className="font-medium">
                {(bus as any).route?.terminal_id || bus.route?.name || 'N/A'}
              </span>
            </div>
          </>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-600">Route:</span>
          <span className="font-medium">{bus.route?.name || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="font-medium text-green-600">{bus.status || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Total Seats:</span>
          <span className="font-medium">{bus.total_seats || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Available:</span>
          <span className="font-medium text-blue-600">{bus.available_seats || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Passengers:</span>
          <span className="font-medium text-orange-600">
            {(bus.total_seats || 0) - (bus.available_seats || 0)}
          </span>
        </div>
        
        {realTimeLocation && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">📍 Real-time GPS Location</div>
            <div className="text-xs text-gray-600">Lat: {realTimeLocation[0].toFixed(6)}</div>
            <div className="text-xs text-gray-600">Lng: {realTimeLocation[1].toFixed(6)}</div>
            {locationAccuracy && (
              <div className="text-xs text-gray-600">Accuracy: {locationAccuracy.toFixed(1)}m</div>
            )}
            {locationTimestamp && (
              <div className="text-xs text-gray-600">Updated: {locationTimestamp}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
