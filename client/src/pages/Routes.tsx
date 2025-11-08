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
      }
      toast({
        title: "Routes Calculated!",
        description: "Your eco-friendly route options are ready.",
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
    mutationFn: async (data: { startLocation: string; endLocation: string; distance: number; carbonSaved: number; routeType: string; pointsEarned: number }) => {
      return await apiRequest("POST", "/api/routes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setCalculatedRoutes([]);
      form.reset();
      toast({
        title: "Route Selected!",
        description: "Points have been credited to your account.",
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
        description: "Failed to save route. Please try again.",
        variant: "destructive",
      });
    },
  });

  const latestRoutes = routes?.slice(-3) || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Eco-Route Optimizer</h1>
        <p className="text-muted-foreground">Find carbon-efficient routes and earn points for sustainable travel</p>
      </div>

      {/* Route Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Calculate Your Route
          </CardTitle>
          <CardDescription>Enter your start and end locations to find eco-friendly routes</CardDescription>
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
                className="w-full md:w-auto"
                data-testid="button-calculate-route"
              >
                {calculateMutation.isPending ? "Calculating..." : "Find Routes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Calculated Route Options */}
      {calculatedRoutes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Route Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              
              return (
                <Card key={index} className="hover-elevate" data-testid={`card-option-${option.mode}`}>
                  <CardHeader>
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
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-medium">{option.distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Duration
                      </span>
                      <span className="font-medium">{Math.round(option.duration / 60)} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">CO₂ Emissions</span>
                      <span className="font-medium">{option.carbonEmissions.toFixed(2)} kg</span>
                    </div>
                    {option.carbonSaved > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          Carbon Saved
                        </span>
                        <span className="font-medium text-primary">{option.carbonSaved.toFixed(2)} kg</span>
                      </div>
                    )}
                    <Button
                      className="w-full mt-2"
                      onClick={() => {
                        const pointsEarned = Math.round(option.carbonSaved * 10);
                        selectRouteMutation.mutate({
                          startLocation: form.getValues("startLocation"),
                          endLocation: form.getValues("endLocation"),
                          distance: option.distance,
                          carbonSaved: option.carbonSaved,
                          routeType: option.mode,
                          pointsEarned,
                        });
                      }}
                      disabled={selectRouteMutation.isPending}
                      data-testid={`button-select-${option.mode}`}
                    >
                      {selectRouteMutation.isPending ? "Saving..." : `Select & Earn ${Math.round(option.carbonSaved * 10)} pts`}
                    </Button>
                  </CardContent>
                </Card>
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
                    {route.pointsEarned > 0 && (
                      <Badge variant="default" data-testid={`badge-points-${index}`}>+{route.pointsEarned} pts</Badge>
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
                      <Badge variant="secondary">+{route.pointsEarned} pts</Badge>
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
