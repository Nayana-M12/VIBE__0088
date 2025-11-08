import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, Leaf, Clock, Navigation, AlertCircle, Car, Bike, PersonStanding } from "lucide-react";
import type { EcoRoute } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { RouteMap } from "@/components/RouteMap";
import { MapboxRouteMap } from "@/components/MapboxRouteMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  startLocation: z.string().min(1, "Start location is required"),
  endLocation: z.string().min(1, "End location is required"),
});

type RouteOption = {
  mode: 'driving' | 'cycling' | 'walking';
  distance: number;
  duration: number;
  carbonEmissions: number;
  carbonSaved: number;
};

export default function Routes() {
  const { toast } = useToast();
  const [calculatedRoutes, setCalculatedRoutes] = useState<RouteOption[]>([]);
  const [selectedMapMode, setSelectedMapMode] = useState<'driving' | 'cycling' | 'walking'>('cycling');
  const [submittingRoute, setSubmittingRoute] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startLocation: "",
      endLocation: "",
    },
  });

  const { data: routes, isLoading: routesLoading } = useQuery<EcoRoute[]>({
    queryKey: ["/api/routes"],
  });

  const calculateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/routes/calculate", values);
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.routes) {
        setCalculatedRoutes(data.routes);
        
        // Automatically select the route with least carbon emission
        const lowestEmissionRoute = [...data.routes].sort((a, b) => a.carbonEmissions - b.carbonEmissions)[0];
        if (lowestEmissionRoute) {
          setSelectedMapMode(lowestEmissionRoute.mode);
        }
      }
      toast({
        title: "Routes Calculated!",
        description: "Showing the most eco-friendly route with lowest carbon emissions.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to calculate routes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectRouteMutation = useMutation({
    mutationFn: async (data: { startLocation: string; endLocation: string; distance: number; carbonSaved: number; routeType: string; ecoBitsEarned: number }) => {
      console.log("🚀 Submitting route:", data.routeType);
      setSubmittingRoute(data.routeType);
      const response = await apiRequest("POST", "/api/routes", data);
      console.log("✅ Route submitted successfully:", data.routeType);
      return response;
    },
    onSuccess: (_, variables) => {
      console.log("✅ Route saved:", variables.routeType);
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setCalculatedRoutes([]);
      form.reset();
      setSubmittingRoute(null);
      toast({
        title: "Route Selected! 🎉",
        description: `Your ${variables.routeType} route saved! You earned ${variables.ecoBitsEarned} ecoBits!`,
      });
    },
    onError: (error: Error) => {
      setSubmittingRoute(null);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save route. Please try again.",
        variant: "destructive",
      });
    },
  });

  const latestRoutes = routes?.slice(-3) || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="glass-card p-6 nature-border eco-shine">
        <h1 className="text-4xl font-display font-bold mb-2 gradient-text">🗺️ Eco-Route Optimizer</h1>
        <p className="text-emerald-200/80 text-lg">Find carbon-efficient routes and earn ecoBits for sustainable travel</p>
      </div>

      {/* Route Calculator */}
      <Card className="glass-card nature-border overflow-hidden relative leaf-pattern">
        <div className="absolute inset-0 nature-gradient pointer-events-none"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-lg pulse-glow">
              <Map className="w-6 h-6" />
            </div>
            <span className="gradient-text text-2xl">Calculate Your Route</span>
          </CardTitle>
          <CardDescription className="text-emerald-200/70">Enter your start and end locations to find eco-friendly routes</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => calculateMutation.mutate(values))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Location</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City" {...field} data-testid="input-start-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Location</FormLabel>
                      <FormControl>
                        <Input placeholder="456 Oak Ave, City" {...field} data-testid="input-end-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={calculateMutation.isPending}
                className="w-full md:w-auto bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm border-2 border-emerald-400/40 eco-shine organic-shadow px-8 py-3 text-base"
                data-testid="button-calculate-route"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {calculateMutation.isPending ? "🔄 Calculating..." : "🔍 Find Routes"}
                </span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Calculated Route Options */}
      {calculatedRoutes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Route Options</h2>
          
          {/* Interactive Map Visualization */}
          <Card className="glass-card nature-border mb-8 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Map className="w-5 h-5 text-green-600" />
                Interactive Route Map
              </h3>
              {(() => {
                const lowestEmissionRoute = [...calculatedRoutes].sort((a, b) => a.carbonEmissions - b.carbonEmissions)[0];
                return (
                  <Badge className="bg-green-600 text-white w-fit">
                    <Leaf className="w-3 h-3 mr-1" />
                    Best: {lowestEmissionRoute.mode} ({lowestEmissionRoute.carbonEmissions.toFixed(2)} kg CO₂)
                  </Badge>
                );
              })()}
            </div>
            
            <Tabs value={selectedMapMode} onValueChange={(value) => setSelectedMapMode(value as any)} className="mb-4">
              <TabsList className="grid w-full grid-cols-3">
                {(() => {
                  const lowestEmissionRoute = [...calculatedRoutes].sort((a, b) => a.carbonEmissions - b.carbonEmissions)[0];
                  return (
                    <>
                      <TabsTrigger value="cycling" className="flex items-center gap-2 relative">
                        <Bike className="w-4 h-4" />
                        Cycling
                        {lowestEmissionRoute.mode === 'cycling' && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="walking" className="flex items-center gap-2 relative">
                        <PersonStanding className="w-4 h-4" />
                        Walking
                        {lowestEmissionRoute.mode === 'walking' && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="driving" className="flex items-center gap-2 relative">
                        <Car className="w-4 h-4" />
                        Driving
                        {lowestEmissionRoute.mode === 'driving' && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        )}
                      </TabsTrigger>
                    </>
                  );
                })()}
              </TabsList>
            </Tabs>

            <MapboxRouteMap
              startLocation={form.getValues("startLocation")}
              endLocation={form.getValues("endLocation")}
              routes={calculatedRoutes}
              selectedMode={selectedMapMode}
            />
          </Card>

          <h3 className="text-lg font-medium mb-6 mt-8">All Route Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calculatedRoutes.map((option, index) => {
              const icons = {
                driving: Car,
                cycling: Bike,
                walking: PersonStanding,
              };
              const Icon = icons[option.mode];
              const modeColors = {
                driving: "text-orange-500",
                cycling: "text-green-500",
                walking: "text-blue-500",
              };
              const getModeIcon = () => {
                switch (option.mode) {
                  case 'cycling':
                    return '🚴';
                  case 'walking':
                    return '🚶';
                  default:
                    return '🚗';
                }
              };
              
              // Check if this is the lowest emission route
              const lowestEmissionRoute = [...calculatedRoutes].sort((a, b) => a.carbonEmissions - b.carbonEmissions)[0];
              const isLowestEmission = option.mode === lowestEmissionRoute.mode;
              
              return (
                <div key={index} className={`${isLowestEmission ? 'pt-4' : ''}`}>
                  <Card 
                    className={`glass-card nature-border relative transition-all duration-300 leaf-pattern h-full flex flex-col ${isLowestEmission ? 'ring-2 ring-emerald-400 shadow-2xl border-emerald-400/60 eco-glow' : ''}`}
                    data-testid={`card-option-${option.mode}`}
                  >
                    {isLowestEmission && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                        <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg pulse-glow border-2 border-emerald-400/50 px-3 py-1 text-xs">
                          <Leaf className="w-3 h-3 mr-1" />
                          🏆 Best
                        </Badge>
                      </div>
                    )}
                    <CardHeader className={`pb-3 ${isLowestEmission ? 'pt-6' : 'pt-4'}`}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${modeColors[option.mode]}`} />
                        {option.mode}
                      </CardTitle>
                      {option.carbonSaved > 0 && (
                        <Badge variant="default">
                          <Leaf className="w-3 h-3 mr-1" />
                          Eco
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    {/* Mini Map */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 h-28 rounded-lg flex items-center justify-center mb-4">
                      <div className="relative w-full px-6">
                        <div className="flex items-center justify-between">
                          <div className="bg-blue-500 text-white rounded-full p-2 shadow-md">
                            <Map className="w-4 h-4" />
                          </div>
                          <div className={`flex-1 mx-3 h-1.5 ${option.carbonSaved > 0 ? 'bg-green-500' : 'bg-orange-500'} rounded-full relative shadow-sm`}>
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl">
                              {getModeIcon()}
                            </div>
                          </div>
                          <div className="bg-green-500 text-white rounded-full p-2 shadow-md">
                            <Navigation className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      {option.carbonSaved > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600 text-white text-[10px] px-2 py-0.5 shadow-sm">
                            <Leaf className="w-2.5 h-2.5 mr-0.5" />
                            -{option.carbonSaved.toFixed(1)}kg
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-muted/30">
                        <span className="text-muted-foreground font-medium">Distance</span>
                        <span className="font-semibold">{option.distance.toFixed(1)} km</span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-muted/30">
                        <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Duration
                        </span>
                        <span className="font-semibold">{Math.round(option.duration / 60)} min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-muted/30">
                        <span className="text-muted-foreground font-medium">CO₂ Emissions</span>
                        <span className="font-semibold">{option.carbonEmissions.toFixed(2)} kg</span>
                      </div>
                      {option.carbonSaved > 0 && (
                        <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                          <span className="text-green-700 dark:text-green-400 flex items-center gap-1.5 font-medium">
                            <Leaf className="w-3.5 h-3.5" />
                            Carbon Saved
                          </span>
                          <span className="font-semibold text-green-700 dark:text-green-400">{option.carbonSaved.toFixed(2)} kg</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 backdrop-blur-sm border-2 border-emerald-400/40 organic-shadow py-5"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Prevent multiple submissions
                        if (submittingRoute !== null) {
                          console.log("⚠️ Already submitting a route, ignoring click");
                          return;
                        }
                        
                        console.log("🖱️ Button clicked for:", option.mode);
                        
                        // Cycling gets flat 15 ecoBits, others get 10 ecoBits per kg CO2 saved
                        const ecoBitsEarned = option.mode === 'cycling' ? 15 : Math.round(option.carbonSaved * 10);
                        selectRouteMutation.mutate({
                          startLocation: form.getValues("startLocation"),
                          endLocation: form.getValues("endLocation"),
                          distance: option.distance,
                          carbonSaved: option.carbonSaved,
                          routeType: option.mode,
                          ecoBitsEarned,
                        });
                      }}
                      disabled={submittingRoute === option.mode}
                      data-testid={`button-select-${option.mode}`}
                    >
                      {submittingRoute === option.mode ? (
                        <div className="flex items-center justify-center">
                          <span className="animate-spin mr-2">⏳</span>
                          Saving...
                        </div>
                      ) : (
                        `Select & Earn ${option.mode === 'cycling' ? 15 : Math.round(option.carbonSaved * 10)} EB`
                      )}
                    </Button>
                  </CardContent>
                </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Routes */}
      {latestRoutes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Recent Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestRoutes.map((route, index) => (
              <Card key={index} data-testid={`card-route-${index}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">{route.routeType} Route</CardTitle>
                    {route.ecoBitsEarned > 0 && (
                      <Badge variant="default" data-testid={`badge-ecoBits-${index}`}>+{route.ecoBitsEarned} EB</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium truncate ml-2" data-testid={`text-start-${index}`}>{route.startLocation}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium truncate ml-2" data-testid={`text-end-${index}`}>{route.endLocation}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-medium" data-testid={`text-distance-${index}`}>{route.distance} km</span>
                  </div>
                  {route.carbonSaved > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        Carbon Saved
                      </span>
                      <span className="font-medium text-primary" data-testid={`text-carbon-${index}`}>{route.carbonSaved} kg</span>
                    </div>
                  )}
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => {
                      form.setValue("startLocation", route.startLocation);
                      form.setValue("endLocation", route.endLocation);
                    }}
                    data-testid={`button-reuse-${index}`}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Reuse Route
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Route History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Routes</h2>
        {routesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : routes && routes.length > 0 ? (
          <div className="space-y-3">
            {routes.slice(0, 10).map((route) => (
              <Card key={route.id} className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{route.startLocation} → {route.endLocation}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(route.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{route.distance} km</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Leaf className="w-3 h-3" />
                        {route.carbonSaved.toFixed(1)} kg saved
                      </Badge>
                      <Badge variant="secondary">+{route.ecoBitsEarned} EB</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No routes yet. Calculate your first eco-friendly route!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
