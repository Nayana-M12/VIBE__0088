import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, AlertCircle, Loader2, Navigation, MapPin, Zap } from "lucide-react";

type MapboxRouteMapProps = {
  startLocation: string;
  endLocation: string;
  routes: Array<{
    mode: 'driving' | 'cycling' | 'walking';
    distance: number;
    duration: number;
    carbonEmissions: number;
    carbonSaved: number;
    geometry?: any;
  }>;
  selectedMode?: 'driving' | 'cycling' | 'walking';
};

export function MapboxRouteMap({ startLocation, endLocation, routes, selectedMode = 'cycling' }: MapboxRouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);

  const selectedRoute = routes.find(r => r.mode === selectedMode) || routes[0];

  // Fetch Mapbox token from backend
  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ['/api/mapbox-token'],
  });

  useEffect(() => {
    // Check if mapboxgl is available
    if (typeof window === 'undefined' || !window.mapboxgl) {
      return;
    }

    if (map.current) {
      // Update existing map with new route
      updateMapRoute();
      return;
    }

    if (!mapContainer.current) return;

    if (tokenLoading || !tokenData?.token) {
      return;
    }

    const MAPBOX_TOKEN = tokenData.token;

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-token-here') {
      setMapError('Mapbox token not configured. Please add MAPBOX_ACCESS_TOKEN to your .env file.');
      return;
    }

    try {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Light theme for better visibility
        center: [0, 0],
        zoom: 12,
        pitch: 45, // 3D tilt
        bearing: 0,
      });

      // Add navigation controls
      map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

      // Add scale control
      map.current.addControl(new window.mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }), 'bottom-left');

      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add 3D buildings layer for visual appeal
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers.find(
          (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
        )?.id;

        map.current.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#d4f1d4',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          },
          labelLayerId
        );

        updateMapRoute();
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please check your internet connection.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [tokenData, tokenLoading]);

  // Update map when route changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      updateMapRoute();
    }
  }, [selectedRoute, mapLoaded]);

  const updateMapRoute = () => {
    if (!map.current || !selectedRoute.geometry) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove existing route layers
    if (map.current.getLayer('route-glow')) map.current.removeLayer('route-glow');
    if (map.current.getLayer('route-outline')) map.current.removeLayer('route-outline');
    if (map.current.getLayer('route')) map.current.removeLayer('route');
    if (map.current.getLayer('route-arrows')) map.current.removeLayer('route-arrows');
    if (map.current.getSource('route')) map.current.removeSource('route');

    const coordinates = selectedRoute.geometry.coordinates;
    const isEcoFriendly = selectedRoute.carbonSaved > 0;

    // Color scheme based on mode and eco-friendliness
    const colorSchemes = {
      cycling: { main: '#10b981', glow: '#34d399', outline: '#059669' },
      walking: { main: '#3b82f6', glow: '#60a5fa', outline: '#2563eb' },
      driving: isEcoFriendly ? { main: '#f59e0b', glow: '#fbbf24', outline: '#d97706' } : { main: '#ef4444', glow: '#f87171', outline: '#dc2626' }
    };

    const colors = colorSchemes[selectedRoute.mode];

    // Add route source
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: selectedRoute.geometry,
      },
    });

    // Add glowing effect layer (bottom)
    map.current.addLayer({
      id: 'route-glow',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': colors.glow,
        'line-width': 16,
        'line-opacity': 0.4,
        'line-blur': 8,
      },
    });

    // Add outline layer (middle)
    map.current.addLayer({
      id: 'route-outline',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': colors.outline,
        'line-width': 10,
        'line-opacity': 0.6,
      },
    });

    // Add main route layer (top)
    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': colors.main,
        'line-width': 6,
        'line-opacity': 1,
      },
    });

    // Fit map to route bounds with animation
    const bounds = coordinates.reduce((bounds: any, coord: any) => {
      return bounds.extend(coord);
    }, new window.mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 80, right: 80 },
      duration: 1500,
      essential: true
    });

    // Create custom start marker
    const startMarkerEl = document.createElement('div');
    startMarkerEl.className = 'custom-marker';
    startMarkerEl.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: bounce 2s infinite;
      ">
        <span style="transform: rotate(45deg); font-size: 18px;">📍</span>
      </div>
    `;

    const startMarker = new window.mapboxgl.Marker({ element: startMarkerEl, anchor: 'bottom' })
      .setLngLat(coordinates[0])
      .setPopup(
        new window.mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
          .setHTML(`
            <div style="padding: 12px; min-width: 200px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 20px;">📍</span>
                <strong style="color: #3b82f6; font-size: 14px;">Starting Point</strong>
              </div>
              <p style="font-size: 12px; color: #64748b; margin: 0;">${startLocation}</p>
            </div>
          `)
      )
      .addTo(map.current);

    markersRef.current.push(startMarker);

    // Create custom end marker
    const endMarkerEl = document.createElement('div');
    endMarkerEl.className = 'custom-marker';
    endMarkerEl.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, ${colors.main}, ${colors.outline});
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      ">
        <span style="transform: rotate(45deg); font-size: 18px;">🎯</span>
      </div>
    `;

    const endMarker = new window.mapboxgl.Marker({ element: endMarkerEl, anchor: 'bottom' })
      .setLngLat(coordinates[coordinates.length - 1])
      .setPopup(
        new window.mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
          .setHTML(`
            <div style="padding: 12px; min-width: 220px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 20px;">🎯</span>
                <strong style="color: ${colors.main}; font-size: 14px;">Destination</strong>
              </div>
              <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">${endLocation}</p>
              <div style="background: ${isEcoFriendly ? '#f0fdf4' : '#fef2f2'}; padding: 8px; border-radius: 8px; border-left: 3px solid ${colors.main};">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <span style="font-size: 16px;">${isEcoFriendly ? '🌱' : '🚗'}</span>
                  <strong style="color: ${colors.main}; font-size: 13px;">
                    ${isEcoFriendly ? 'Eco-Friendly Route' : 'Standard Route'}
                  </strong>
                </div>
                <div style="font-size: 11px; color: #64748b; line-height: 1.5;">
                  <div>Distance: ${selectedRoute.distance.toFixed(1)} km</div>
                  <div>Duration: ${Math.round(selectedRoute.duration / 60)} min</div>
                  <div>CO₂: ${selectedRoute.carbonEmissions.toFixed(2)} kg</div>
                  ${selectedRoute.carbonSaved > 0 ? `<div style="color: ${colors.main}; font-weight: 600;">✨ Saved: ${selectedRoute.carbonSaved.toFixed(2)} kg CO₂</div>` : ''}
                </div>
              </div>
            </div>
          `)
      )
      .addTo(map.current);

    markersRef.current.push(endMarker);

    // Add midpoint marker with route info
    const midIndex = Math.floor(coordinates.length / 2);
    const midCoord = coordinates[midIndex];
    
    const midMarkerEl = document.createElement('div');
    midMarkerEl.innerHTML = `
      <div style="
        background: white;
        padding: 6px 12px;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        font-size: 11px;
        font-weight: 600;
        color: ${colors.main};
        border: 2px solid ${colors.main};
        white-space: nowrap;
      ">
        ${selectedRoute.mode === 'cycling' ? '🚴' : selectedRoute.mode === 'walking' ? '🚶' : '🚗'} ${selectedRoute.distance.toFixed(1)} km
      </div>
    `;

    const midMarker = new window.mapboxgl.Marker({ element: midMarkerEl })
      .setLngLat(midCoord)
      .addTo(map.current);

    markersRef.current.push(midMarker);
  };

  // Loading state
  if (tokenLoading) {
    return (
      <Card className="glass-card nature-border overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 h-[500px] flex items-center justify-center">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                <div className="absolute inset-0 animate-ping">
                  <Loader2 className="w-12 h-12 text-emerald-400 opacity-30" />
                </div>
              </div>
              <p className="text-emerald-700 font-medium">Loading interactive map...</p>
              <p className="text-emerald-600/70 text-sm mt-1">Preparing your eco-route visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (mapError) {
    return (
      <Card className="glass-card nature-border overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 h-[500px] flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">🗺️ Map Setup Required</h3>
              <p className="text-amber-700 mb-6">{mapError}</p>
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 text-left shadow-lg border-2 border-amber-200">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-amber-900">Quick Setup Guide:</h4>
                </div>
                <ol className="space-y-3 text-sm text-amber-800">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700">1</span>
                    <span>Visit <a href="https://account.mapbox.com/auth/signup/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">mapbox.com</a> and sign up (free)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700">2</span>
                    <span>Copy your <strong>default public token</strong> (starts with <code className="bg-amber-100 px-1 rounded">pk.</code>)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700">3</span>
                    <span>Add to <code className="bg-amber-100 px-1 rounded">.env</code> file: <code className="bg-amber-100 px-1 rounded text-xs">MAPBOX_ACCESS_TOKEN=your_token</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700">4</span>
                    <span>Restart the server and refresh this page</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback if Mapbox is not available
  if (typeof window !== 'undefined' && !window.mapboxgl) {
    return (
      <Card className="glass-card nature-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Map visualization requires Mapbox GL JS. The script should load automatically. Please refresh the page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show simplified view if no geometry data
  if (!selectedRoute.geometry) {
    return (
      <Card className="glass-card nature-border overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-blue-50 via-emerald-50 to-green-50 h-[500px] flex items-center justify-center p-8">
            <div className="text-center max-w-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 mb-6">
                <MapPin className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-3">🗺️ Route Preview</h3>
              <p className="text-emerald-700 mb-6">
                Configure your Mapbox token to see the actual route on an interactive map
              </p>
              
              {/* Route Info Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg">
                  <div className="text-3xl mb-2">📏</div>
                  <div className="text-2xl font-bold text-emerald-600">{selectedRoute.distance.toFixed(1)}</div>
                  <div className="text-xs text-emerald-700">kilometers</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg">
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-2xl font-bold text-blue-600">{Math.round(selectedRoute.duration / 60)}</div>
                  <div className="text-xs text-blue-700">minutes</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg">
                  <div className="text-3xl mb-2">💨</div>
                  <div className="text-2xl font-bold text-orange-600">{selectedRoute.carbonEmissions.toFixed(2)}</div>
                  <div className="text-xs text-orange-700">kg CO₂</div>
                </div>
                {selectedRoute.carbonSaved > 0 && (
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 backdrop-blur rounded-xl p-4 shadow-lg border-2 border-green-300">
                    <div className="text-3xl mb-2">🌱</div>
                    <div className="text-2xl font-bold text-green-600">{selectedRoute.carbonSaved.toFixed(2)}</div>
                    <div className="text-xs text-green-700 font-semibold">kg CO₂ saved!</div>
                  </div>
                )}
              </div>

              {/* Simple Route Visualization */}
              <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl mb-2 shadow-lg">
                      📍
                    </div>
                    <div className="text-xs text-blue-700 font-medium max-w-[100px] truncate">{startLocation}</div>
                  </div>
                  
                  <div className="flex-1 mx-4 relative">
                    <div className={`h-2 rounded-full ${selectedRoute.carbonSaved > 0 ? 'bg-gradient-to-r from-blue-500 via-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-orange-500'}`}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full shadow-md border-2 border-emerald-400">
                      <span className="text-xl">
                        {selectedRoute.mode === 'cycling' ? '🚴' : selectedRoute.mode === 'walking' ? '🚶' : '🚗'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full ${selectedRoute.carbonSaved > 0 ? 'bg-green-500' : 'bg-orange-500'} flex items-center justify-center text-white text-xl mb-2 shadow-lg`}>
                      🎯
                    </div>
                    <div className="text-xs text-green-700 font-medium max-w-[100px] truncate">{endLocation}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card nature-border overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        <div className="relative">
          {/* Map Container with enhanced styling */}
          <div ref={mapContainer} className="h-[500px] w-full" style={{ 
            borderRadius: '0.75rem',
          }} />

          {/* Animated Info Overlay */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 pointer-events-none z-10">
            <Badge className="bg-white/95 backdrop-blur-md shadow-lg border-2 border-emerald-200 text-emerald-700 pointer-events-auto hover:scale-105 transition-transform">
              <Navigation className="w-3 h-3 mr-1" />
              <span className="text-xs font-bold">
                {selectedRoute.distance.toFixed(1)} km • {Math.round(selectedRoute.duration / 60)} min
              </span>
            </Badge>
            <Badge className="bg-white/95 backdrop-blur-md shadow-lg border-2 border-blue-200 text-blue-700 pointer-events-auto hover:scale-105 transition-transform">
              <span className="text-xs font-bold">💨 {selectedRoute.carbonEmissions.toFixed(2)} kg CO₂</span>
            </Badge>
            {selectedRoute.carbonSaved > 0 && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg pointer-events-auto hover:scale-105 transition-transform animate-pulse">
                <Leaf className="w-3 h-3 mr-1" />
                <span className="text-xs font-bold">Saved {selectedRoute.carbonSaved.toFixed(2)} kg!</span>
              </Badge>
            )}
          </div>

          {/* Mode Badge with Icon */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            <Badge className="bg-white/95 backdrop-blur-md shadow-xl border-2 border-emerald-300 capitalize pointer-events-auto text-base px-4 py-2 hover:scale-105 transition-transform">
              <span className="mr-2 text-xl">
                {selectedRoute.mode === 'cycling' ? '🚴' : selectedRoute.mode === 'walking' ? '🚶' : '🚗'}
              </span>
              <span className="font-bold text-emerald-700">{selectedRoute.mode} Mode</span>
            </Badge>
          </div>

          {/* Eco Badge for eco-friendly routes */}
          {selectedRoute.carbonSaved > 0 && (
            <div className="absolute top-4 right-4 pointer-events-none z-10">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
                <Leaf className="w-4 h-4" />
                <span className="text-sm font-bold">Eco Route!</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    mapboxgl: any;
  }
}
