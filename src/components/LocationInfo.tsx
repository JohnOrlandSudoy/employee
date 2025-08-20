import React from 'react';

interface PlaceInfo {
  city?: string;
  barangay?: string;
  country?: string;
  display?: string;
}

interface LocationInfoProps {
  realTimeLocation: [number, number];
  locationAccuracy: number | null;
  locationTimestamp: string | null;
  placeInfo: PlaceInfo;
}

export const LocationInfo: React.FC<LocationInfoProps> = ({
  realTimeLocation,
  locationAccuracy,
  locationTimestamp,
  placeInfo,
}) => {
  return (
    <div className="absolute bottom-2 left-2 z-[1000] bg-white/95 md:bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200 max-w-[90vw] md:max-w-xs">
      <div className="text-[11px] md:text-xs space-y-1">
        <div className="font-semibold text-gray-900">📍 Current Location</div>
        <div className="text-gray-600 grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="col-span-1">Lat: {realTimeLocation[0].toFixed(6)}</div>
          <div className="col-span-1">Lng: {realTimeLocation[1].toFixed(6)}</div>
          {locationAccuracy && <div className="col-span-2">Accuracy: {locationAccuracy.toFixed(1)}m</div>}
          {locationTimestamp && <div className="col-span-2">Time: {locationTimestamp}</div>}
          {(placeInfo.city || placeInfo.barangay || placeInfo.country) && (
            <div className="col-span-2">Place: {[placeInfo.barangay, placeInfo.city, placeInfo.country].filter(Boolean).join(', ')}</div>
          )}
          {placeInfo.display && (
            <div className="col-span-2 mt-1">Address: {placeInfo.display}</div>
          )}
        </div>
      </div>
    </div>
  );
};
