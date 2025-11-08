import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, UserCheck, Zap, Leaf, Droplet } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

export default function Bond() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const { data: allUsers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
    select: (data: any) => {
      // Combine all users from leaderboard
      const usersMap = new Map<string, User>();
      
      if (data.byEcoBits) {
        data.byEcoBits.forEach((user: User) => usersMap.set(user.id, user));
      }
      if (data.byCarbonSaved) {
        data.byCarbonSaved.forEach((user: User) => usersMap.set(user.id, user));
      }
      if (data.byWaterSaved) {
        data.byWaterSaved.forEach((user: User) => usersMap.set(user.id, user));
      }
      
      return Array.from(usersMap.values()).sort((a, b) => b.ecoBits - a.ecoBits);
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="glass-card p-6 nature-border eco-shine">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-lg pulse-glow">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 gradient-text">🤝 Bond</h1>
            <p className="text-emerald-200/80 text-lg">Build bonds with sustainability champions around the world</p>
          </div>
        </div>
      </div>

      {/* Bond Members */}
      <Card className="glass-card nature-border leaf-pattern">
        <CardHeader>
          <CardTitle className="gradient-text text-2xl">Eco Warriors</CardTitle>
          <CardDescription className="text-emerald-200/70">
            Join with people making a difference. Build your sustainability bonds!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => <UserCardSkeleton key={i} />)}
            </div>
          ) : allUsers && allUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allUsers.map((user) => (
                <UserCard key={user.id} user={user} currentUser={currentUser} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No bonds yet. Be the first to join!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserCard({ user, currentUser }: { user: User; currentUser: User | null }) {
  const { toast } = useToast();

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

  const isCurrentUser = currentUser?.id === user.id;

  return (
    <Card className="glass-card nature-border hover:border-emerald-400/60 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 ring-2 ring-emerald-400/30">
            <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback className="text-lg bg-gradient-to-br from-emerald-500/30 to-green-500/30">
              {user.firstName?.[0] || user.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate gradient-text">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email}
                </h3>
                {isCurrentUser && (
                  <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-200 mt-1">
                    You
                  </Badge>
                )}
              </div>
              
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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20">
                  <Zap className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">{user.ecoBits}</p>
                  <p className="text-muted-foreground">EB</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-green-500/20">
                  <Leaf className="w-3 h-3 text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">{user.totalCarbonSaved.toFixed(1)}</p>
                  <p className="text-muted-foreground">kg</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/20">
                  <Droplet className="w-3 h-3 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">{user.totalWaterSaved.toFixed(0)}</p>
                  <p className="text-muted-foreground">L</p>
                </div>
              </div>
            </div>

            {/* Follow Stats */}
            {stats && (
              <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-emerald-400/20">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="font-semibold text-emerald-200">{stats.followerCount}</span> followers
                </span>
                <span>•</span>
                <span>
                  <span className="font-semibold text-emerald-200">{stats.followingCount}</span> following
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
