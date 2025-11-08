import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Droplet, Award, AlertCircle } from "lucide-react";
import type { WaterRecord } from "@shared/schema";
import { insertWaterRecordSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const formSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format"),
  billAmount: z.coerce.number().positive("Bill amount must be positive"),
  consumption: z.coerce.number().positive("Consumption must be positive"),
});

export default function Water() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: new Date().toISOString().slice(0, 7),
      billAmount: "" as any,
      consumption: "" as any,
    },
  });

  const { data: records, isLoading } = useQuery<WaterRecord[]>({
    queryKey: ["/api/water"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/water/analyze", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      form.reset({
        month: new Date().toISOString().slice(0, 7),
        billAmount: "" as any,
        consumption: "" as any,
      });
      toast({
        title: "Analysis Complete!",
        description: "Your water data has been analyzed and points have been awarded.",
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
        description: "Failed to analyze water data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const chartData = records?.slice(-6).map(r => ({
    month: r.month,
    consumption: r.consumption,
  })) || [];

  const latestRecord = records?.[0];

  const getEfficiencyLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "primary" };
    if (score >= 60) return { label: "Good", color: "primary" };
    if (score >= 40) return { label: "Average", color: "secondary" };
    return { label: "Needs Improvement", color: "destructive" };
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Water Tracker</h1>
        <p className="text-muted-foreground">Monitor your water usage and get efficiency insights</p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="w-5 h-5" />
            Submit Water Data
          </CardTitle>
          <CardDescription>Enter your monthly water bill details for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => analyzeMutation.mutate(values))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <FormControl>
                        <Input type="month" {...field} data-testid="input-water-month" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="45.00"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          data-testid="input-water-bill"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="consumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consumption (Liters)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="15000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          data-testid="input-water-consumption"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={analyzeMutation.isPending}
                className="w-full md:w-auto"
                data-testid="button-analyze-water"
              >
                {analyzeMutation.isPending ? "Analyzing..." : "Analyze Usage"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Efficiency Score */}
      {latestRecord && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Efficiency Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{latestRecord.efficiencyScore || 0}</div>
                      <div className="text-xs text-muted-foreground">out of 100</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <Badge variant={getEfficiencyLevel(latestRecord.efficiencyScore || 0).color as any}>
                  {getEfficiencyLevel(latestRecord.efficiencyScore || 0).label}
                </Badge>
                <p className="text-sm text-muted-foreground">Points Earned: +{latestRecord.pointsEarned}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {latestRecord.aiInsights ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm">{latestRecord.aiInsights}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Analyzing your water usage patterns...</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Chart */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : records && records.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Water Usage Trends</CardTitle>
            <CardDescription>Your consumption over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumption" fill="hsl(var(--chart-2))" name="Consumption (L)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No water data yet. Submit your first bill to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
