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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

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
        description: "Your water data has been analyzed and ecoBits have been awarded.",
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
      <div className="glass-card p-6 nature-border eco-shine">
        <h1 className="text-4xl font-display font-bold mb-2 gradient-text">💧 Water Tracker</h1>
        <p className="text-emerald-200/80 text-lg">Monitor your water usage and get efficiency insights</p>
      </div>

      {/* Input Form */}
      <Card className="glass-card nature-border leaf-pattern">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-lg pulse-glow">
              <Droplet className="w-6 h-6" />
            </div>
            <span className="gradient-text text-2xl">Submit Water Data</span>
          </CardTitle>
          <CardDescription className="text-emerald-200/70">Enter your monthly water bill details for analysis</CardDescription>
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
                <p className="text-sm text-muted-foreground">EcoBits Earned: +{latestRecord.ecoBitsEarned}</p>
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
        <Card className="glass-card nature-border">
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : records && records.length > 0 ? (
        <Card className="glass-card nature-border relative overflow-hidden">
          {/* Animated Water Wave Background */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="absolute bottom-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1"/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05"/>
                </linearGradient>
              </defs>
              <path d="M0,60 C300,90 600,30 900,60 C1050,75 1200,60 1200,60 L1200,120 L0,120 Z" fill="url(#waveGradient)">
                <animate attributeName="d" dur="10s" repeatCount="indefinite"
                  values="M0,60 C300,90 600,30 900,60 C1050,75 1200,60 1200,60 L1200,120 L0,120 Z;
                          M0,60 C300,30 600,90 900,60 C1050,45 1200,60 1200,60 L1200,120 L0,120 Z;
                          M0,60 C300,90 600,30 900,60 C1050,75 1200,60 1200,60 L1200,120 L0,120 Z"/>
              </path>
            </svg>
            {/* Floating Water Drops */}
            <div className="absolute top-10 left-[10%] text-4xl opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>💧</div>
            <div className="absolute top-20 left-[30%] text-3xl opacity-15 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>💧</div>
            <div className="absolute top-16 right-[20%] text-3xl opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>💧</div>
            <div className="absolute top-24 right-[40%] text-2xl opacity-10 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}>💧</div>
          </div>
          
          <CardHeader className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                    <Droplet className="w-6 h-6" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold">
                    💧 Water Usage Trends
                  </span>
                </CardTitle>
                <CardDescription className="text-blue-700">Your consumption over the last 6 months</CardDescription>
              </div>
              
              {/* Average Usage Display */}
              {(() => {
                const last6Months = records.slice(0, 6);
                const totalConsumption = last6Months.reduce((sum, r) => sum + r.consumption, 0);
                const averageConsumption = totalConsumption / last6Months.length;
                const averageKL = averageConsumption / 1000;

                return (
                  <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300 shadow-lg">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-blue-700 mb-1">6-Month Average</p>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-3xl font-bold text-blue-600">{averageConsumption.toFixed(0)}</span>
                        <span className="text-sm font-medium text-blue-500">liters</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">({averageKL.toFixed(2)} kL)</p>
                      {averageKL <= 12 ? (
                        <Badge className="mt-2 bg-green-600 text-white">
                          ⭐ Excellent!
                        </Badge>
                      ) : averageKL <= 20 ? (
                        <Badge className="mt-2 bg-blue-600 text-white">
                          👍 Good
                        </Badge>
                      ) : (
                        <Badge className="mt-2 bg-orange-600 text-white">
                          💡 Can Improve
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/30">
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1}/>
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.6}/>
                    </linearGradient>
                    <filter id="waterGlow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <pattern id="waterPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#0ea5e9" opacity="0.1"/>
                    </pattern>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#0ea5e9" 
                    strokeOpacity={0.15}
                    fill="url(#waterPattern)"
                  />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#0369a1', fontSize: 13, fontWeight: 600 }}
                    stroke="#0ea5e9"
                    strokeOpacity={0.4}
                    axisLine={{ strokeWidth: 2 }}
                  />
                  <YAxis 
                    tick={{ fill: '#0369a1', fontSize: 13, fontWeight: 600 }}
                    stroke="#0ea5e9"
                    strokeOpacity={0.4}
                    label={{ value: 'Liters', angle: -90, position: 'insideLeft', fill: '#0369a1', fontWeight: 600 }}
                    axisLine={{ strokeWidth: 2 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      border: '2px solid rgba(14, 165, 233, 0.4)',
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(16px)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ color: '#0c4a6e', fontWeight: 700, fontSize: 14, marginBottom: 8 }}
                    itemStyle={{ color: '#0369a1', fontWeight: 600 }}
                    cursor={{ fill: 'rgba(14, 165, 233, 0.15)', radius: 8 }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '24px',
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#0369a1'
                    }}
                    iconType="circle"
                  />
                  {/* Average Reference Line */}
                  {(() => {
                    const totalConsumption = chartData.reduce((sum, d) => sum + d.consumption, 0);
                    const average = totalConsumption / chartData.length;
                    return (
                      <ReferenceLine 
                        y={average} 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        label={{ 
                          value: `Avg: ${average.toFixed(0)}L`, 
                          position: 'right',
                          fill: '#f59e0b',
                          fontWeight: 700,
                          fontSize: 12
                        }}
                      />
                    );
                  })()}
                  <Bar 
                    dataKey="consumption" 
                    fill="url(#waterGradient)" 
                    name="💧 Water Consumption (Liters)"
                    radius={[12, 12, 0, 0]}
                    filter="url(#waterGlow)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <text
                        key={`label-${index}`}
                        x={0}
                        y={0}
                        fill="#0369a1"
                        fontSize={12}
                        fontWeight={600}
                        textAnchor="middle"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
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
