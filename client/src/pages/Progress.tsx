import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Leaf, Droplet, Zap, Trophy, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { EnergyRecord, WaterRecord, EcoRoute, Post } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

  const totalPointsEarned = 
    (energyRecords?.reduce((sum, r) => sum + r.pointsEarned, 0) || 0) +
    (waterRecords?.reduce((sum, r) => sum + r.pointsEarned, 0) || 0) +
    (routes?.reduce((sum, r) => sum + r.pointsEarned, 0) || 0);

  const achievementsData = [
    {
      month: energyRecords?.[5]?.month || "",
      points: (energyRecords?.[5]?.pointsEarned || 0) + (waterRecords?.[5]?.pointsEarned || 0),
    },
    {
      month: energyRecords?.[4]?.month || "",
      points: (energyRecords?.[4]?.pointsEarned || 0) + (waterRecords?.[4]?.pointsEarned || 0),
    },
    {
      month: energyRecords?.[3]?.month || "",
      points: (energyRecords?.[3]?.pointsEarned || 0) + (waterRecords?.[3]?.pointsEarned || 0),
    },
    {
      month: energyRecords?.[2]?.month || "",
      points: (energyRecords?.[2]?.pointsEarned || 0) + (waterRecords?.[2]?.pointsEarned || 0),
    },
    {
      month: energyRecords?.[1]?.month || "",
      points: (energyRecords?.[1]?.pointsEarned || 0) + (waterRecords?.[1]?.pointsEarned || 0),
    },
    {
      month: energyRecords?.[0]?.month || "",
      points: (energyRecords?.[0]?.pointsEarned || 0) + (waterRecords?.[0]?.pointsEarned || 0),
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
      title: "100 Points Club",
      description: "Earned your first 100 points",
      date: user?.createdAt,
      icon: Trophy,
      achieved: (user?.points || 0) >= 100,
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Points Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold" data-testid="stat-total-points">{totalPointsEarned}</p>
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

      {/* Points Trend */}
      {achievementsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Points Earned Over Time</CardTitle>
            <CardDescription>Your monthly sustainability achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={achievementsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="points" stroke="hsl(var(--primary))" strokeWidth={3} name="Points" />
              </LineChart>
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
