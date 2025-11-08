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
import { Zap, TrendingDown, Lightbulb, AlertCircle } from "lucide-react";
import type { EnergyRecord } from "@shared/schema";
import { insertEnergyRecordSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const formSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format"),
  billAmount: z.coerce.number().positive("Bill amount must be positive"),
  consumption: z.coerce.number().positive("Consumption must be positive"),
});

export default function Energy() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: new Date().toISOString().slice(0, 7),
      billAmount: "" as any,
      consumption: "" as any,
    },
  });

  const { data: records, isLoading } = useQuery<EnergyRecord[]>({
    queryKey: ["/api/energy"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/energy/analyze", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/energy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      form.reset({
        month: new Date().toISOString().slice(0, 7),
        billAmount: "" as any,
        consumption: "" as any,
      });
      toast({
        title: "Analysis Complete!",
        description: "Your energy data has been analyzed and points have been awarded.",
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
        description: "Failed to analyze energy data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const chartData = records?.slice(-6).map(r => ({
    month: r.month,
    consumption: r.consumption,
    wastage: r.predictedWastage || 0,
  })) || [];

  const latestRecord = records?.[0];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Energy Predictor</h1>
        <p className="text-muted-foreground">AI-powered analysis of your electricity consumption patterns</p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Submit Energy Data
          </CardTitle>
          <CardDescription>Enter your monthly electricity bill details for AI analysis</CardDescription>
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
                        <Input type="month" {...field} data-testid="input-energy-month" />
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
                          placeholder="150.00"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          data-testid="input-energy-bill"
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
                      <FormLabel>Consumption (kWh)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="850"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          data-testid="input-energy-consumption"
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
                data-testid="button-analyze-energy"
              >
                {analyzeMutation.isPending ? "Analyzing..." : "Analyze Usage"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Latest Analysis */}
      {latestRecord && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wastage Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Predicted Wastage</span>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span className="text-2xl font-bold">{latestRecord.predictedWastage?.toFixed(1) || 0} kWh</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Wastage Percentage</span>
                <span className="text-2xl font-bold text-destructive">
                  {latestRecord.wastagePercentage?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Points Earned</span>
                <span className="text-2xl font-bold text-primary">+{latestRecord.pointsEarned}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestRecord.aiInsights ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm">{latestRecord.aiInsights}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Analyzing your energy patterns...</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend Chart */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : records && records.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Consumption Trends</CardTitle>
            <CardDescription>Your energy usage over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="consumption" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Consumption (kWh)" />
                <Line type="monotone" dataKey="wastage" stroke="hsl(var(--destructive))" strokeWidth={2} name="Wastage (kWh)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No energy data yet. Submit your first bill to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
