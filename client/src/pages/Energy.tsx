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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const formSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format"),
  billAmount: z.coerce.number().positive("Bill amount must be positive"),
  consumption: z.coerce.number().positive("Consumption must be positive"),
});

export default function Energy() {
  const { toast } = useToast();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="glass-card p-6 nature-border eco-shine">
        <h1 className="text-4xl font-display font-bold mb-2 gradient-text">⚡ Energy Tracker</h1>
        <p className="text-emerald-200/80 text-lg">Monitor your energy consumption and reduce wastage</p>
      </div>

      <EnergyContent toast={toast} />
    </div>
  );
}

function EnergyContent({ toast }: { toast: any }) {
  
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
        description: "Your energy data has been analyzed and ecoBits have been awarded.",
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
      {/* Input Form */}
      <Card className="glass-card nature-border leaf-pattern">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-lg pulse-glow">
              <Zap className="w-6 h-6" />
            </div>
            <span className="gradient-text text-2xl">Submit Energy Data</span>
          </CardTitle>
          <CardDescription className="text-emerald-200/70">Enter your monthly electricity bill details for AI analysis</CardDescription>
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
                className="w-full md:w-auto bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border-2 border-emerald-400/40 eco-shine organic-shadow px-8 py-3"
                data-testid="button-analyze-energy"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {analyzeMutation.isPending ? "⚡ Analyzing..." : "⚡ Analyze Usage"}
                </span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Latest Analysis */}
      {latestRecord && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card nature-border">
            <CardHeader>
              <CardTitle className="text-xl gradient-text">Wastage Analysis</CardTitle>
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
                <span className="text-sm text-muted-foreground">EcoBits Earned</span>
                <span className="text-2xl font-bold text-primary">+{latestRecord.ecoBitsEarned}</span>
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
        <Card className="glass-card nature-border">
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : records && records.length > 0 ? (
        <Card className="glass-card nature-border leaf-pattern relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 pointer-events-none"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="gradient-text text-2xl flex items-center gap-2">
              <Zap className="w-6 h-6 text-emerald-600" />
              Consumption Trends
            </CardTitle>
            <CardDescription className="text-emerald-700">Your energy usage over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="glass-card p-4 rounded-xl">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="wastageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="#10b981" strokeOpacity={0.1} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#059669', fontSize: 12, fontWeight: 500 }}
                  stroke="#10b981"
                  strokeOpacity={0.3}
                />
                <YAxis 
                  tick={{ fill: '#059669', fontSize: 12, fontWeight: 500 }}
                  stroke="#10b981"
                  strokeOpacity={0.3}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
                    backdropFilter: 'blur(12px)'
                  }}
                  labelStyle={{ color: '#065f46', fontWeight: 600 }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontWeight: 600,
                    color: '#047857'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5, filter: 'url(#glow)' }}
                  activeDot={{ r: 8, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                  name="⚡ Consumption (kWh)"
                  filter="url(#glow)"
                />
                <Line 
                  type="monotone" 
                  dataKey="wastage" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: '#dc2626', stroke: '#fff', strokeWidth: 2 }}
                  name="⚠️ Wastage (kWh)"
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Consumption Breakdown Pie Chart */}
      {records && records.length > 0 && (() => {
        const latestRecord = records[0];
        const consumption = latestRecord.consumption || 0;
        const wastage = latestRecord.predictedWastage || 0;
        const efficient = Math.max(0, consumption - wastage);

        const pieData = [
          { name: 'Efficient Usage', value: efficient, color: '#10b981' },
          { name: 'Wastage', value: wastage, color: '#ef4444' },
        ];

        return (
          <Card className="glass-card nature-border">
            <CardHeader>
              <CardTitle className="gradient-text text-2xl flex items-center gap-2">
                <Zap className="w-6 h-6 text-emerald-600" />
                Consumption Breakdown
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Latest month: {latestRecord.month}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="glass-card p-4 rounded-xl">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="glass-card p-4 rounded-xl border-l-4 border-emerald-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-700">Efficient Usage</span>
                      <span className="text-2xl font-bold text-emerald-600">{efficient.toFixed(1)} kWh</span>
                    </div>
                    <div className="w-full bg-emerald-100 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(efficient / consumption) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      {((efficient / consumption) * 100).toFixed(1)}% of total consumption
                    </p>
                  </div>

                  <div className="glass-card p-4 rounded-xl border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-700">Wastage</span>
                      <span className="text-2xl font-bold text-red-600">{wastage.toFixed(1)} kWh</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(wastage / consumption) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      {((wastage / consumption) * 100).toFixed(1)}% of total consumption
                    </p>
                  </div>

                  <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-800">Total Consumption</span>
                      <span className="text-3xl font-bold text-emerald-700">{consumption.toFixed(1)} kWh</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-2">
                      💡 Reduce wastage to save more energy and earn more ecoBits!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {!records || records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No energy data yet. Submit your first bill to get started!</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
