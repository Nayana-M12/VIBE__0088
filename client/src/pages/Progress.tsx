import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Leaf, Droplet, Zap, Trophy, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { EnergyRecord, WaterRecord, EcoRoute, Post } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Progress() {
  const { user } = useAuth();

  const { data: energyRecords } = useQuery<EnergyRecord[]>({
    queryKey: ["/api/energy"],
  });

  const { data: waterRecords } = useQuery<WaterRecord[]>({
    queryKey: ["/api/water"],
  });

  const { data: routes } = useQuery<EcoRoute[]>({
    queryKey: ["/api/routes"],
  });

  const { data: posts } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const totalEcoBitsEarned = 
    (energyRecords?.reduce((sum, r) => sum + r.ecoBitsEarned, 0) || 0) +
    (waterRecords?.reduce((sum, r) => sum + r.ecoBitsEarned, 0) || 0) +
    (routes?.reduce((sum, r) => sum + r.ecoBitsEarned, 0) || 0);

  const achievementsData = [
    {
      month: energyRecords?.[5]?.month || "",
      ecoBits: (energyRecords?.[5]?.ecoBitsEarned || 0) + (waterRecords?.[5]?.ecoBitsEarned || 0),
    },
    {
      month: energyRecords?.[4]?.month || "",
      ecoBits: (energyRecords?.[4]?.ecoBitsEarned || 0) + (waterRecords?.[4]?.ecoBitsEarned || 0),
    },
    {
      month: energyRecords?.[3]?.month || "",
      ecoBits: (energyRecords?.[3]?.ecoBitsEarned || 0) + (waterRecords?.[3]?.ecoBitsEarned || 0),
    },
    {
      month: energyRecords?.[2]?.month || "",
      ecoBits: (energyRecords?.[2]?.ecoBitsEarned || 0) + (waterRecords?.[2]?.ecoBitsEarned || 0),
    },
    {
      month: energyRecords?.[1]?.month || "",
      ecoBits: (energyRecords?.[1]?.ecoBitsEarned || 0) + (waterRecords?.[1]?.ecoBitsEarned || 0),
    },
    {
      month: energyRecords?.[0]?.month || "",
      ecoBits: (energyRecords?.[0]?.ecoBitsEarned || 0) + (waterRecords?.[0]?.ecoBitsEarned || 0),
    },
  ].filter(d => d.month);

  const milestones = [
    {
      title: "First Energy Analysis",
      description: "Analyzed your first electricity bill",
      date: energyRecords?.[energyRecords.length - 1]?.createdAt,
      icon: Zap,
      achieved: (energyRecords?.length || 0) > 0,
    },
    {
      title: "Water Warrior",
      description: "Tracked your first water usage",
      date: waterRecords?.[waterRecords.length - 1]?.createdAt,
      icon: Droplet,
      achieved: (waterRecords?.length || 0) > 0,
    },
    {
      title: "Eco Driver",
      description: "Took your first eco-friendly route",
      date: routes?.[routes.length - 1]?.createdAt,
      icon: Leaf,
      achieved: (routes?.length || 0) > 0,
    },
    {
      title: "100 EcoBits Club",
      description: "Earned your first 100 ecoBits",
      date: user?.createdAt,
      icon: Trophy,
      achieved: (user?.ecoBits || 0) >= 100,
    },
    {
      title: "Carbon Champion",
      description: "Saved 10kg of CO₂",
      date: user?.createdAt,
      icon: Leaf,
      achieved: (user?.totalCarbonSaved || 0) >= 10,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground">Track your sustainability journey and celebrate milestones</p>
      </div>

      {/* Lifetime Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total EcoBits Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold" data-testid="stat-total-ecoBits">{totalEcoBitsEarned}</p>
                <p className="text-xs text-muted-foreground">All-time earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold" data-testid="stat-carbon-saved">{(user?.totalCarbonSaved || 0).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg CO₂</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Water Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                <Droplet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold" data-testid="stat-water-saved">{(user?.totalWaterSaved || 0).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Liters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EcoBits Trend */}
      {achievementsData.length > 0 && (
        <Card className="glass-card nature-border leaf-pattern">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-lg pulse-glow">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="gradient-text text-2xl">EcoBits Earned Over Time</CardTitle>
                <CardDescription className="text-emerald-200/70">Track your monthly sustainability achievements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={achievementsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorEcoBits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#10b98120" />
                <XAxis 
                  dataKey="month" 
                  stroke="#10b981" 
                  style={{ fontSize: '12px', fontWeight: 500 }}
                />
                <YAxis 
                  stroke="#10b981"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                  label={{ value: 'EcoBits', angle: -90, position: 'insideLeft', fill: '#10b981' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                  labelStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar 
                  dataKey="ecoBits" 
                  fill="url(#colorEcoBits)"
                  radius={[8, 8, 0, 0]}
                  name="EcoBits Earned"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Activity Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{energyRecords?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Energy Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Droplet className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{waterRecords?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Water Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Leaf className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{routes?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Eco Routes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{posts?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Community Posts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>Achievements unlocked on your sustainability journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  milestone.achieved ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"
                }`}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                  milestone.achieved ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <milestone.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{milestone.title}</h3>
                    {milestone.achieved && <Badge variant="default">Achieved</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{milestone.description}</p>
                  {milestone.achieved && milestone.date && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
