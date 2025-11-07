import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Leaf, Droplet, Route, Zap } from "lucide-react";
import type { User } from "@shared/schema";

export default function Leaderboard() {
  const { data: leaderboardData, isLoading } = useQuery<{
    byPoints: User[];
    byCarbonSaved: User[];
    byWaterSaved: User[];
  }>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">See how you compare to other sustainability champions</p>
      </div>

      <Tabs defaultValue="points" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="points" data-testid="tab-points">
            <Zap className="w-4 h-4 mr-2" />
            Points
          </TabsTrigger>
          <TabsTrigger value="carbon" data-testid="tab-carbon">
            <Leaf className="w-4 h-4 mr-2" />
            Carbon Saved
          </TabsTrigger>
          <TabsTrigger value="water" data-testid="tab-water">
            <Droplet className="w-4 h-4 mr-2" />
            Water Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>Top Points Earners</CardTitle>
              <CardDescription>Users with the highest sustainability points</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <LeaderboardSkeleton key={i} />)}
                </div>
              ) : leaderboardData?.byPoints && leaderboardData.byPoints.length > 0 ? (
                <div className="space-y-3">
                  {leaderboardData.byPoints.map((user, index) => (
                    <LeaderboardItem
                      key={user.id}
                      rank={index + 1}
                      user={user}
                      value={user.points}
                      label="points"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No data available yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carbon">
          <Card>
            <CardHeader>
              <CardTitle>Top Carbon Savers</CardTitle>
              <CardDescription>Users who have saved the most CO₂</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <LeaderboardSkeleton key={i} />)}
                </div>
              ) : leaderboardData?.byCarbonSaved && leaderboardData.byCarbonSaved.length > 0 ? (
                <div className="space-y-3">
                  {leaderboardData.byCarbonSaved.map((user, index) => (
                    <LeaderboardItem
                      key={user.id}
                      rank={index + 1}
                      user={user}
                      value={user.totalCarbonSaved.toFixed(1)}
                      label="kg CO₂"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No data available yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="water">
          <Card>
            <CardHeader>
              <CardTitle>Top Water Conservers</CardTitle>
              <CardDescription>Users who have saved the most water</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <LeaderboardSkeleton key={i} />)}
                </div>
              ) : leaderboardData?.byWaterSaved && leaderboardData.byWaterSaved.length > 0 ? (
                <div className="space-y-3">
                  {leaderboardData.byWaterSaved.map((user, index) => (
                    <LeaderboardItem
                      key={user.id}
                      rank={index + 1}
                      user={user}
                      value={user.totalWaterSaved.toFixed(0)}
                      label="liters"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No data available yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LeaderboardItem({
  rank,
  user,
  value,
  label,
}: {
  rank: number;
  user: User;
  value: string | number;
  label: string;
}) {
  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover-elevate" data-testid={`leaderboard-item-${rank}`}>
      <div className={`flex items-center justify-center w-10 h-10 ${getMedalColor(rank)}`}>
        {rank <= 3 ? <Trophy className="w-6 h-6" /> : <span className="font-bold">{rank}</span>}
      </div>
      <Avatar className="w-12 h-12">
        <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
        <AvatarFallback>{user.firstName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">
          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
        </p>
        <p className="text-sm text-muted-foreground">
          {value} {label}
        </p>
      </div>
      {rank <= 3 && (
        <Badge variant={rank === 1 ? "default" : "secondary"}>
          {rank === 1 ? "Champion" : rank === 2 ? "Runner-up" : "3rd Place"}
        </Badge>
      )}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="w-10 h-10" />
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
