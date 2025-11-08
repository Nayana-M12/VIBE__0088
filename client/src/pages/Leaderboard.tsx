import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Leaf, Droplet, Route, Zap, UserPlus, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import type { User } from "@shared/schema";

export default function Leaderboard() {
  const { data: leaderboardData, isLoading } = useQuery<{
    byEcoBits: User[];
    byCarbonSaved: User[];
    byWaterSaved: User[];
  }>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="glass-card p-6 nature-border eco-shine">
        <h1 className="text-4xl font-display font-bold mb-2 gradient-text">🏆 Leaderboard</h1>
        <p className="text-emerald-200/80 text-lg">See how you compare to other sustainability champions</p>
      </div>

      <Tabs defaultValue="ecoBits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 glass-card nature-border p-2">
          <TabsTrigger value="ecoBits" data-testid="tab-ecoBits" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
            <Zap className="w-4 h-4 mr-2" />
            EcoBits
          </TabsTrigger>
          <TabsTrigger value="carbon" data-testid="tab-carbon" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
            <Leaf className="w-4 h-4 mr-2" />
            Carbon Saved
          </TabsTrigger>
          <TabsTrigger value="water" data-testid="tab-water" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
            <Droplet className="w-4 h-4 mr-2" />
            Water Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ecoBits">
          <Card className="glass-card nature-border leaf-pattern">
            <CardHeader>
              <CardTitle className="gradient-text text-2xl">Top EcoBits Earners</CardTitle>
              <CardDescription className="text-emerald-200/70">Users with the highest sustainability ecoBits</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <LeaderboardSkeleton key={i} />)}
                </div>
              ) : leaderboardData?.byEcoBits && leaderboardData.byEcoBits.length > 0 ? (
                <div className="space-y-3">
                  {leaderboardData.byEcoBits.map((user, index) => (
                    <LeaderboardItem
                      key={user.id}
                      rank={index + 1}
                      user={user}
                      value={user.ecoBits}
                      label="ecoBits"
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
          <Card className="glass-card nature-border leaf-pattern">
            <CardHeader>
              <CardTitle className="gradient-text text-2xl">Top Carbon Savers</CardTitle>
              <CardDescription className="text-emerald-200/70">Users who have saved the most CO₂</CardDescription>
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
          <Card className="glass-card nature-border leaf-pattern">
            <CardHeader>
              <CardTitle className="gradient-text text-2xl">Top Water Conservers</CardTitle>
              <CardDescription className="text-emerald-200/70">Users who have saved the most water</CardDescription>
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
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [followStats, setFollowStats] = useState<{ isFollowing: boolean; followerCount: number; followingCount: number } | null>(null);

  // Fetch follow stats for this user
  const { data: stats } = useQuery({
    queryKey: [`/api/users/${user.id}/follow-stats`],
    enabled: !!currentUser,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${user.id}/follow`, {});
      const data = await response.json();
      console.log("Connection response:", data);
      return data;
    },
    onSuccess: (data) => {
      const previousStatus = stats?.connectionStatus;
      const newStatus = data?.status;
      
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/follow-stats`] });
      
      // Show appropriate message
      if (newStatus === 'pending') {
        // Sent a new request
        toast({
          title: "Request Sent!",
          description: `Connection request sent to ${user.firstName || user.email}`,
        });
      } else if (newStatus === null || newStatus === undefined) {
        // Removed connection or cancelled request
        if (previousStatus === 'accepted') {
          toast({
            title: "Disconnected",
            description: `You disconnected from ${user.firstName || user.email}`,
          });
        } else if (previousStatus === 'pending') {
          toast({
            title: "Request Cancelled",
            description: `Connection request cancelled`,
          });
        } else {
          // No previous status - this means we just sent a request
          toast({
            title: "Request Sent!",
            description: `Connection request sent to ${user.firstName || user.email}`,
          });
        }
      }
    },
    onError: (error: any) => {
      console.error("Connection error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update join status",
        variant: "destructive",
      });
    },
  });

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  const isCurrentUser = currentUser?.id === user.id;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover-elevate glass-card nature-border" data-testid={`leaderboard-item-${rank}`}>
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
        {stats && (
          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {stats.followerCount} followers
            </span>
            <span>•</span>
            <span>{stats.followingCount} following</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {rank <= 3 && (
          <Badge variant={rank === 1 ? "default" : "secondary"}>
            {rank === 1 ? "Champion" : rank === 2 ? "Runner-up" : "3rd Place"}
          </Badge>
        )}
        {!isCurrentUser && currentUser && (
          <Button
            size="sm"
            variant={stats?.connectionStatus ? "outline" : "default"}
            onClick={() => followMutation.mutate()}
            disabled={followMutation.isPending || stats?.connectionStatus === 'pending'}
            className={stats?.connectionStatus === 'accepted'
              ? "border-emerald-400 text-emerald-600 hover:bg-emerald-50" 
              : stats?.connectionStatus === 'pending'
              ? "border-amber-400 text-amber-600 cursor-not-allowed opacity-70"
              : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white"
            }
          >
            {stats?.connectionStatus === 'accepted' ? (
              <>
                <UserCheck className="w-4 h-4 mr-1" />
                Joined
              </>
            ) : stats?.connectionStatus === 'pending' ? (
              <>
                <UserCheck className="w-4 h-4 mr-1" />
                Request Sent
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1" />
                Join With
              </>
            )}
          </Button>
        )}
        {isCurrentUser && (
          <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-200">You</Badge>
        )}
      </div>
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
