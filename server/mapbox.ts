// Mapbox Directions API integration for eco-friendly routing
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const MAPBOX_API_BASE = "https://api.mapbox.com/directions/v5/mapbox";

// Carbon emission factors (kg CO2 per km)
const CARBON_FACTORS = {
  driving: 0.192, // Average car emissions
  cycling: 0,     // Zero emissions
  walking: 0,     // Zero emissions
};

export interface RouteOption {
  mode: 'driving' | 'cycling' | 'walking';
  distance: number; // in kilometers
  duration: number; // in seconds
  carbonEmissions: number; // kg CO2
  carbonSaved: number; // kg CO2 saved vs driving
  geometry?: any; // GeoJSON LineString
}

export async function calculateEcoRoutes(
  startLocation: string,
  endLocation: string
): Promise<RouteOption[]> {
  if (!MAPBOX_TOKEN) {
    console.warn("MAPBOX_ACCESS_TOKEN not set, using fallback routes");
    return getFallbackRoutes(startLocation, endLocation);
  }

  try {
    // Geocode locations first
    const [startCoords, endCoords] = await Promise.all([
      geocodeLocation(startLocation),
      geocodeLocation(endLocation),
    ]);

    if (!startCoords || !endCoords) {
      return getFallbackRoutes(startLocation, endLocation);
    }

    // Get routes for different modes
    const modes: Array<'driving' | 'cycling' | 'walking'> = ['driving', 'cycling', 'walking'];
    const routePromises = modes.map(mode => getDirections(startCoords, endCoords, mode));
    
    const routes = await Promise.all(routePromises);
    
    // Calculate carbon emissions and savings
    const drivingDistance = routes[0]?.distance || 0;
    const drivingEmissions = drivingDistance * CARBON_FACTORS.driving;

    return routes.map((route, index) => {
      const mode = modes[index];
      const emissions = route.distance * CARBON_FACTORS[mode];
      const saved = Math.max(0, drivingEmissions - emissions);

      return {
        mode,
        distance: route.distance,
        duration: route.duration,
        carbonEmissions: emissions,
        carbonSaved: saved,
        geometry: route.geometry,
      };
    });
  } catch (error) {
    console.error("Error calculating routes with Mapbox:", error);
    return getFallbackRoutes(startLocation, endLocation);
  }
}

async function geocodeLocation(location: string): Promise<[number, number] | null> {
  try {
    const encodedLocation = encodeURIComponent(location);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Mapbox geocoding failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return [lng, lat];
    }
    
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

async function getDirections(
  start: [number, number],
  end: [number, number],
  profile: 'driving' | 'cycling' | 'walking'
): Promise<{ distance: number; duration: number; geometry?: any }> {
  try {
    const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
    const url = `${MAPBOX_API_BASE}/${profile}/${coordinates}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Mapbox directions failed: ${response.status}`);
      return getFallbackRoute(profile);
    }

    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance / 1000, // Convert meters to kilometers
        duration: route.duration,
        geometry: route.geometry,
      };
    }
    
    return getFallbackRoute(profile);
  } catch (error) {
    console.error(`Error getting ${profile} directions:`, error);
    return getFallbackRoute(profile);
  }
}

function getFallbackRoute(profile: 'driving' | 'cycling' | 'walking'): { distance: number; duration: number } {
  // Fallback estimates based on typical speeds
  const baseDistance = 15; // km
  const speeds = {
    driving: 50,  // km/h
    cycling: 20,  // km/h
    walking: 5,   // km/h
  };
  
  const distance = baseDistance;
  const duration = (distance / speeds[profile]) * 3600; // Convert to seconds
  
  return { distance, duration };
}

function getFallbackRoutes(startLocation: string, endLocation: string): RouteOption[] {
  const baseDistance = 15; // km
  const drivingEmissions = baseDistance * CARBON_FACTORS.driving;

  return [
    {
      mode: 'driving',
      distance: baseDistance,
      duration: 1080, // 18 minutes
      carbonEmissions: drivingEmissions,
      carbonSaved: 0,
    },
    {
      mode: 'cycling',
      distance: baseDistance,
      duration: 2700, // 45 minutes
      carbonEmissions: 0,
      carbonSaved: drivingEmissions,
    },
    {
      mode: 'walking',
      distance: baseDistance,
      duration: 10800, // 3 hours
      carbonEmissions: 0,
      carbonSaved: drivingEmissions,
    },
  ];
}
