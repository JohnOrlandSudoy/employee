// Default map center coordinates (Manila, Philippines)
export const DEFAULT_MAP_CENTER: [number, number] = [14.6760, 121.0437];

// Default map zoom level
export const DEFAULT_MAP_ZOOM = 13;

// Map tile configuration
export const MAP_TILE_CONFIG = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Route polyline configuration
export const ROUTE_POLYLINE_CONFIG = {
  color: "#F43F5E",
  weight: 4,
  opacity: 0.7
};

// Location history trail configuration
export const LOCATION_TRAIL_CONFIG = {
  color: "#10AA64",
  weight: 3,
  opacity: 0.6,
  dashArray: "5, 5"
};

// Geolocation configuration
export const GEOLOCATION_CONFIG = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
};

// Geocoding configuration
export const GEOCODING_CONFIG = {
  debounceDelay: 800,
  fallbackTimeout: 5000
};
