import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin, Navigation2 } from "lucide-react";

type RouteMapProps = {
  startLocation: string;
  endLocation: string;
  distance: number;
  carbonEmissions: number;
  carbonSaved: number;
  mode: 'driving' | 'cycling' | 'walking';
};

export function RouteMap({ startLocation, endLocation, distance, carbonEmissions, carbonSaved, mode }: RouteMapProps) {
  // Color coding based on carbon emissions
  const getEmissionColor = () => {
    if (carbonSaved > 0) return "bg-green-500";
    if (carbonEmissions < 2) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'cycling':
        return '🚴';
      case 'walking':
        return '🚶';
      default:
        return '🚗';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Map Visualization */}
        <div className="relative bg-gradient-to-br from-blue-50 to-green-50 h-64 flex items-center justify-center">
          {/* Route Path */}
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <div className="relative w-full max-w-2xl">
              {/* Start Point */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="mt-2 bg-white px-3 py-1 rounded-full shadow text-xs font-medium max-w-[120px] truncate">
                  {startLocation}
                </div>
              </div>

              {/* Route Line */}
              <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2">
                <div className={`h-2 ${getEmissionColor()} rounded-full relative`}>
                  {/* Animated vehicle */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-pulse">
                    {getModeIcon()}
                  </div>
                  {/* Distance marker */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow text-xs font-medium whitespace-nowrap">
                    {distance.toFixed(1)} km
                  </div>
                </div>
              </div>

              {/* End Point */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-green-600 text-white rounded-full p-3 shadow-lg">
                  <Navigation2 className="w-6 h-6" />
                </div>
                <div className="mt-2 bg-white px-3 py-1 rounded-full shadow text-xs font-medium max-w-[120px] truncate">
                  {endLocation}
                </div>
              </div>
            </div>
          </div>

          {/* Carbon Info Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur">
              <span className="text-xs">CO₂: {carbonEmissions.toFixed(2)} kg</span>
            </Badge>
            {carbonSaved > 0 && (
              <Badge className="bg-green-600 text-white">
                <Leaf className="w-3 h-3 mr-1" />
                <span className="text-xs">Saved: {carbonSaved.toFixed(2)} kg</span>
              </Badge>
            )}
          </div>

          {/* Mode Badge */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Badge variant="outline" className="bg-white/90 backdrop-blur capitalize">
              {mode} Mode
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
