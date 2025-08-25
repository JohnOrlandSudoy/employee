import { useMemo } from 'react';
import { Icon } from 'leaflet';

export const useMapIcons = () => {
  const icons = useMemo(() => {
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

    // Current location bus icon (using custom bus-icon.png, larger and more prominent)
    const currentLocationBusIcon = new Icon({
      iconUrl: '/bus-icon.png',
      iconSize: [50, 50], // Slightly larger for current location
      iconAnchor: [25, 50],
      popupAnchor: [0, -50],
    });

    // Location history marker icon
    const locationHistoryIcon = new Icon({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQiIGZpbGw9IiMxMEFBNjQiIG9wYWNpdHk9IjAuNiIvPgo8L3N2Zz4K',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    return {
      busIcon,
      terminalIcon,
      currentLocationBusIcon,
      locationHistoryIcon,
    };
  }, []);

  return icons;
};
