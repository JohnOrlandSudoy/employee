import React from 'react';

interface LocationControlsProps {
  isTracking: boolean;
  onGetLocation: () => void;
  onToggleTracking: () => void;
  onClearHistory: () => void;
}

export const LocationControls: React.FC<LocationControlsProps> = ({
  isTracking,
  onGetLocation,
  onToggleTracking,
  onClearHistory,
}) => {
  return (
    <div className="absolute top-2 left-2 z-[1000] bg-white/95 md:bg-white/90 backdrop-blur-sm rounded-lg px-2 md:px-3 py-2 shadow-lg border border-gray-200 max-w-[90vw] md:max-w-none">
      <div className="flex flex-row md:flex-col gap-2">
        <button
          onClick={onGetLocation}
          className="bg-blue-500 text-white px-3 py-2 md:py-1 rounded text-[11px] md:text-xs hover:bg-blue-600 transition-colors"
        >
          📍 Get Location
        </button>
        <button
          onClick={onToggleTracking}
          className={`px-3 py-2 md:py-1 rounded text-[11px] md:text-xs transition-colors ${
            isTracking 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isTracking ? '⏹️ Stop' : '▶️ Track'}
        </button>
        <button
          onClick={onClearHistory}
          className="bg-gray-500 text-white px-3 py-2 md:py-1 rounded text-[11px] md:text-xs hover:bg-gray-600 transition-colors"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
};
