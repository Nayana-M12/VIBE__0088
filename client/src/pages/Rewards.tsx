import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Ticket, Award, Calendar, AlertCircle, Sparkles } from "lucide-react";
import type { ScratchCard, Coupon, UserScratchCard, UserCoupon, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";

type ScratchCardWithRedemption = ScratchCard & { userCard?: UserScratchCard };
type CouponWithRedemption = Coupon & { userCoupon?: UserCoupon };

export default function Rewards() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: scratchCards, isLoading: cardsLoading } = useQuery<ScratchCardWithRedemption[]>({
    queryKey: ["/api/rewards/scratch-cards"],
  });

  const { data: coupons, isLoading: couponsLoading } = useQuery<CouponWithRedemption[]>({
    queryKey: ["/api/rewards/coupons"],
  });

  const { data: myScratchCards } = useQuery<(UserScratchCard & { scratchCard: ScratchCard })[]>({
    queryKey: ["/api/rewards/my-scratch-cards"],
  });

  const { data: myCoupons } = useQuery<(UserCoupon & { coupon: Coupon })[]>({
    queryKey: ["/api/rewards/my-coupons"],
  });

  const redeemScratchCard = useMutation({
    mutationFn: async (cardId: string) => {
      return await apiRequest("POST", "/api/rewards/redeem-scratch-card", { scratchCardId: cardId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/scratch-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/my-scratch-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Scratch Card Redeemed!",
        description: "Check 'My Rewards' tab to scratch and reveal your prize.",
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
        description: error.message || "Failed to redeem scratch card.",
        variant: "destructive",
      });
    },
  });

  const redeemCoupon = useMutation({
    mutationFn: async (couponId: string) => {
      return await apiRequest("POST", "/api/rewards/redeem-coupon", { couponId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/coupons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/my-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Coupon Redeemed!",
        description: "Check 'My Rewards' tab to view your coupon code.",
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
        description: error.message || "Failed to redeem coupon.",
        variant: "destructive",
      });
    },
  });

  const scratchMutation = useMutation({
    mutationFn: async (userCardId: string) => {
      return await apiRequest("POST", "/api/rewards/scratch", { userCardId });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/my-scratch-cards"] });
      toast({
        title: "Congratulations!",
        description: `You won: ${data.prize}`,
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
        description: "Failed to scratch card.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Rewards Hub</h1>
          <p className="text-muted-foreground">Redeem your points for eco-friendly rewards</p>
        </div>
        <Card className="min-w-[200px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Your Points</p>
                <p className="text-2xl font-bold" data-testid="text-user-points">{user?.points || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scratch-cards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scratch-cards">Scratch Cards</TabsTrigger>
          <TabsTrigger value="coupons">Discount Coupons</TabsTrigger>
          <TabsTrigger value="my-rewards">My Rewards</TabsTrigger>
        </TabsList>

        {/* Scratch Cards Tab */}
        <TabsContent value="scratch-cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Scratch Cards</CardTitle>
              <CardDescription>Redeem points for eco-friendly home decor and personal essentials</CardDescription>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
                </div>
              ) : scratchCards && scratchCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scratchCards.map(card => (
                    <Card key={card.id} className="hover-elevate">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary mx-auto">
                          <Gift className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold mb-1">{card.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{card.description}</p>
                          <Badge>{card.category.replace("_", " ")}</Badge>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm font-medium">{card.pointsCost} points</span>
                          <Button
                            size="sm"
                            onClick={() => redeemScratchCard.mutate(card.id)}
                            disabled={!user || user.points < card.pointsCost || redeemScratchCard.isPending}
                            data-testid={`button-redeem-card-${card.id}`}
                          >
                            {redeemScratchCard.isPending ? "Redeeming..." : "Redeem"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No scratch cards available at the moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discount Coupons</CardTitle>
              <CardDescription>Premium rewards for eco-friendly products and courses</CardDescription>
            </CardHeader>
            <CardContent>
              {couponsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-40" />)}
                </div>
              ) : coupons && coupons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map((coupon: any) => (
                    <Card key={coupon.id} className={`hover-elevate ${!coupon.isAvailable ? 'opacity-60' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                            <Ticket className="w-7 h-7" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1">{coupon.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{coupon.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="default">{coupon.discountPercentage}% OFF</Badge>
                              <Badge variant="outline">{coupon.brandName}</Badge>
                              {coupon.eventType && (
                                <Badge variant="secondary" className="gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {coupon.eventType.replace("_", " ")}
                                </Badge>
                              )}
                            </div>
                            {coupon.availabilityMessage && !coupon.isAvailable && (
                              <p className="text-xs text-muted-foreground mb-2">{coupon.availabilityMessage}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{coupon.pointsCost} points</span>
                              <Button
                                size="sm"
                                onClick={() => redeemCoupon.mutate(coupon.id)}
                                disabled={!user || user.points < coupon.pointsCost || redeemCoupon.isPending || !coupon.isAvailable}
                                data-testid={`button-redeem-coupon-${coupon.id}`}
                              >
                                {redeemCoupon.isPending ? "Claiming..." : (!coupon.isAvailable ? "Unavailable" : "Claim")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No coupons available. Check back on special event days!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Rewards Tab */}
        <TabsContent value="my-rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Scratch Cards</CardTitle>
            </CardHeader>
            <CardContent>
              {myScratchCards && myScratchCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myScratchCards.map(userCard => (
                    <Card key={userCard.id} className="hover-elevate">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary mx-auto">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold mb-1">{userCard.scratchCard.name}</h3>
                          {userCard.isScratched ? (
                            <>
                              <Badge variant="default" className="mb-2">Revealed</Badge>
                              <p className="text-lg font-semibold text-primary">{userCard.prize}</p>
                            </>
                          ) : (
                            <Button
                              className="w-full"
                              onClick={() => scratchMutation.mutate(userCard.id)}
                              disabled={scratchMutation.isPending}
                              data-testid={`button-scratch-${userCard.id}`}
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              {scratchMutation.isPending ? "Scratching..." : "Scratch Now!"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">You haven't redeemed any scratch cards yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              {myCoupons && myCoupons.length > 0 ? (
                <div className="space-y-3">
                  {myCoupons.map(userCoupon => (
                    <Card key={userCoupon.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">{userCoupon.coupon.name}</h3>
                            <p className="text-sm text-muted-foreground">{userCoupon.coupon.brandName}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={userCoupon.isUsed ? "secondary" : "default"}>
                              {userCoupon.coupon.discountPercentage}% OFF
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {userCoupon.isUsed ? "Used" : "Available"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">You haven't claimed any coupons yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
