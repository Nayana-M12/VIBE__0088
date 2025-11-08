import { useState } from "react";
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
import { ScratchCard as ScratchCardComponent } from "@/components/ScratchCard";

type ScratchCardWithRedemption = ScratchCard & { userCard?: UserScratchCard };
type CouponWithRedemption = Coupon & { userCoupon?: UserCoupon };

export default function Rewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [redeemingCardId, setRedeemingCardId] = useState<string | null>(null);
  const [redeemingCouponId, setRedeemingCouponId] = useState<string | null>(null);
  const [scratchingCardId, setScratchingCardId] = useState<string | null>(null);

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
      // Prevent double redemption
      if (redeemingCardId) {
        throw new Error("Already redeeming a card");
      }
      setRedeemingCardId(cardId);
      const res = await apiRequest("POST", "/api/rewards/redeem-scratch-card", { scratchCardId: cardId });
      return await res.json();
    },
    onSuccess: () => {
      setRedeemingCardId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/scratch-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/my-scratch-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Scratch Card Redeemed!",
        description: "Check 'My Rewards' tab to scratch and reveal your prize.",
      });
    },
    onError: (error: Error) => {
      setRedeemingCardId(null);
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
      // Prevent double redemption
      if (redeemingCouponId) {
        throw new Error("Already redeeming a coupon");
      }
      setRedeemingCouponId(couponId);
      const res = await apiRequest("POST", "/api/rewards/redeem-coupon", { couponId });
      return await res.json();
    },
    onSuccess: () => {
      setRedeemingCouponId(null);
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
      const res = await apiRequest("POST", "/api/rewards/scratch", { userCardId });
      return await res.json();
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
        <div className="glass-card p-6 nature-border eco-shine flex-1">
          <h1 className="text-4xl font-display font-bold mb-2 gradient-text">🎁 Rewards Hub</h1>
          <p className="text-emerald-200/80 text-lg">Redeem your ecoBits for eco-friendly rewards</p>
        </div>
        <Card className="glass-card nature-border min-w-[220px] organic-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-teal-500/30 backdrop-blur-sm shadow-lg pulse-glow">
                <Award className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-emerald-200/60 font-medium uppercase tracking-wider">Your EcoBits</p>
                <p className="text-3xl font-bold gradient-text" data-testid="text-user-ecoBits">{user?.ecoBits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scratch-cards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 glass-card nature-border p-2">
          <TabsTrigger value="scratch-cards" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
            🎴 Scratch Cards
          </TabsTrigger>
          <TabsTrigger value="coupons" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
            🎫 Discount Coupons
          </TabsTrigger>
          <TabsTrigger value="my-rewards" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
            ⭐ My Rewards
          </TabsTrigger>
        </TabsList>

        {/* Scratch Cards Tab */}
        <TabsContent value="scratch-cards" className="space-y-4">
          <Card className="glass-card nature-border leaf-pattern">
            <CardHeader>
              <CardTitle className="gradient-text text-2xl">Available Scratch Cards</CardTitle>
              <CardDescription className="text-emerald-200/70">Redeem ecoBits for eco-friendly home decor and personal essentials</CardDescription>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
                </div>
              ) : scratchCards && scratchCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scratchCards.map(card => (
                    <Card key={card.id} className="glass-card nature-border hover:border-emerald-400/60 transition-all duration-300 group">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-teal-500/30 backdrop-blur-sm shadow-lg mx-auto group-hover:shadow-xl transition-all duration-300 pulse-glow">
                          <Gift className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-bold text-lg gradient-text mb-2">{card.name}</h3>
                          <p className="text-sm text-emerald-200/70 mb-3">{card.description}</p>
                          <div className="flex gap-2 justify-center flex-wrap">
                            <Badge className="bg-emerald-600/30 border-emerald-400/50 text-emerald-200">{card.category.replace("_", " ")}</Badge>
                            {(card as any).isRedeemed && <Badge className="bg-green-600/30 border-green-400/50 text-green-200">✓ Redeemed</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-emerald-400/20">
                          <span className="text-sm font-bold gradient-text">{card.ecoBitsCost} ecoBits</span>
                          <Button
                            size="sm"
                            onClick={() => redeemScratchCard.mutate(card.id)}
                            disabled={!user || user.ecoBits < card.ecoBitsCost || redeemingCardId === card.id || (card as any).isRedeemed}
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-400/40"
                            data-testid={`button-redeem-card-${card.id}`}
                          >
                            {(card as any).isRedeemed ? "✓ Redeemed" : (redeemingCardId === card.id ? "⏳ Redeeming..." : "🎁 Redeem")}
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
        <TabsContent value="coupons" className="space-y-6">
          {couponsLoading ? (
            <Card className="glass-card nature-border leaf-pattern">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
                </div>
              </CardContent>
            </Card>
          ) : coupons && coupons.length > 0 ? (
            <>
              {/* Golden Tier */}
              {coupons.filter((c: any) => c.tier === 'golden').length > 0 && (
                <Card className="glass-card nature-border leaf-pattern border-amber-400/40">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-white shadow-lg">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">🥇 Golden Tier</CardTitle>
                        <CardDescription className="text-emerald-200/70">60-150 EcoBits • 10-15% Discount</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coupons.filter((c: any) => c.tier === 'golden').map((coupon: any) => (
                        <Card key={coupon.id} className={`glass-card nature-border hover:border-amber-400/60 transition-all duration-300 group ${!coupon.isAvailable ? 'opacity-60' : ''}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-amber-600/30 backdrop-blur-sm shadow-lg flex-shrink-0 group-hover:shadow-xl transition-all duration-300">
                                <Ticket className="w-8 h-8 text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg gradient-text mb-1">{coupon.name}</h3>
                                <p className="text-sm text-emerald-200/70 mb-3">{coupon.description}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white border-amber-400/50">{coupon.discountPercentage}% OFF</Badge>
                                  <Badge className="bg-amber-600/20 border-amber-400/50 text-amber-200">{coupon.brandName}</Badge>
                                  {(coupon as any).isRedeemed && <Badge className="bg-green-600/30 border-green-400/50 text-green-200">✓ Claimed</Badge>}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-amber-400/20">
                                  <span className="text-sm font-bold gradient-text">{coupon.ecoBitsCost} EB</span>
                                  <Button
                                    size="sm"
                                    onClick={() => redeemCoupon.mutate(coupon.id)}
                                    disabled={!user || user.ecoBits < coupon.ecoBitsCost || redeemingCouponId === coupon.id || (coupon as any).isRedeemed}
                                    className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    {(coupon as any).isRedeemed ? "✓ Claimed" : (redeemingCouponId === coupon.id ? "⏳..." : "🎫 Claim")}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Platinum Tier */}
              {coupons.filter((c: any) => c.tier === 'platinum').length > 0 && (
                <Card className="glass-card nature-border leaf-pattern border-slate-400/40">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-400 via-gray-300 to-slate-500 text-white shadow-lg">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl bg-gradient-to-r from-slate-300 to-gray-400 bg-clip-text text-transparent">🥈 Platinum Tier</CardTitle>
                        <CardDescription className="text-emerald-200/70">160-250 EcoBits • 15-20% Discount</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coupons.filter((c: any) => c.tier === 'platinum').map((coupon: any) => (
                        <Card key={coupon.id} className={`glass-card nature-border hover:border-slate-400/60 transition-all duration-300 group ${!coupon.isAvailable ? 'opacity-60' : ''}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400/30 via-gray-300/20 to-slate-500/30 backdrop-blur-sm shadow-lg flex-shrink-0 group-hover:shadow-xl transition-all duration-300">
                                <Ticket className="w-8 h-8 text-slate-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg gradient-text mb-1">{coupon.name}</h3>
                                <p className="text-sm text-emerald-200/70 mb-3">{coupon.description}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge className="bg-gradient-to-r from-slate-600 to-gray-600 text-white border-slate-400/50">{coupon.discountPercentage}% OFF</Badge>
                                  <Badge className="bg-slate-600/20 border-slate-400/50 text-slate-200">{coupon.brandName}</Badge>
                                  {(coupon as any).isRedeemed && <Badge className="bg-green-600/30 border-green-400/50 text-green-200">✓ Claimed</Badge>}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-400/20">
                                  <span className="text-sm font-bold gradient-text">{coupon.ecoBitsCost} EB</span>
                                  <Button
                                    size="sm"
                                    onClick={() => redeemCoupon.mutate(coupon.id)}
                                    disabled={!user || user.ecoBits < coupon.ecoBitsCost || redeemingCouponId === coupon.id || (coupon as any).isRedeemed}
                                    className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-500 hover:to-gray-500 text-white shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    {(coupon as any).isRedeemed ? "✓ Claimed" : (redeemingCouponId === coupon.id ? "⏳..." : "🎫 Claim")}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Platinum Premium Tier */}
              {coupons.filter((c: any) => c.tier === 'platinum_premium').length > 0 && (
                <Card className="glass-card nature-border leaf-pattern border-purple-400/40">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 text-white shadow-lg pulse-glow">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">💎 Platinum Premium</CardTitle>
                        <CardDescription className="text-emerald-200/70">260-400+ EcoBits • 20-25% Discount • Special Occasions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coupons.filter((c: any) => c.tier === 'platinum_premium').map((coupon: any) => (
                        <Card key={coupon.id} className={`glass-card nature-border hover:border-purple-400/60 transition-all duration-300 group ${!coupon.isAvailable ? 'opacity-60' : ''}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 via-violet-500/20 to-purple-600/30 backdrop-blur-sm shadow-lg flex-shrink-0 group-hover:shadow-xl transition-all duration-300 pulse-glow">
                                <Ticket className="w-8 h-8 text-purple-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg gradient-text mb-1">{coupon.name}</h3>
                                <p className="text-sm text-emerald-200/70 mb-3">{coupon.description}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge className="bg-gradient-to-r from-purple-600 to-violet-600 text-white border-purple-400/50">{coupon.discountPercentage}% OFF</Badge>
                                  <Badge className="bg-purple-600/20 border-purple-400/50 text-purple-200">{coupon.brandName}</Badge>
                                  {coupon.eventType && (
                                    <Badge className="bg-teal-600/20 border-teal-400/50 text-teal-200 gap-1">
                                      <Calendar className="w-3 h-3" />
                                      Special
                                    </Badge>
                                  )}
                                  {(coupon as any).isRedeemed && <Badge className="bg-green-600/30 border-green-400/50 text-green-200">✓ Claimed</Badge>}
                                </div>
                                {coupon.availabilityMessage && !coupon.isAvailable && (
                                  <p className="text-xs text-amber-300/70 mb-2">⏰ {coupon.availabilityMessage}</p>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-purple-400/20">
                                  <span className="text-sm font-bold gradient-text">{coupon.ecoBitsCost} EB</span>
                                  <Button
                                    size="sm"
                                    onClick={() => redeemCoupon.mutate(coupon.id)}
                                    disabled={!user || user.ecoBits < coupon.ecoBitsCost || redeemingCouponId === coupon.id || !coupon.isAvailable || (coupon as any).isRedeemed}
                                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    {(coupon as any).isRedeemed ? "✓ Claimed" : (redeemingCouponId === coupon.id ? "⏳..." : (!coupon.isAvailable ? "🔒 Soon" : "💎 Claim"))}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass-card nature-border leaf-pattern">
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No coupons available. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Rewards Tab */}
        <TabsContent value="my-rewards" className="space-y-6">
          <Card className="glass-card nature-border leaf-pattern">
            <CardHeader>
              <CardTitle className="gradient-text text-2xl">My Scratch Cards</CardTitle>
            </CardHeader>
            <CardContent>
              {myScratchCards && myScratchCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myScratchCards.map(userCard => (
                    <div key={userCard.id} className="space-y-3">
                      <div className="text-center">
                        <h3 className="font-bold text-lg gradient-text mb-1">{userCard.scratchCard.name}</h3>
                        <p className="text-sm text-emerald-200/70">{userCard.scratchCard.description}</p>
                      </div>
                      
                      {userCard.isScratched ? (
                        <Card className="glass-card nature-border">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-xl mx-auto">
                              <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-center">
                              <Badge className="mb-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-400/50">✨ Revealed</Badge>
                              <p className="text-2xl font-bold gradient-text">{userCard.prize}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <ScratchCardComponent
                          prize={userCard.prize || "Mystery Prize"}
                          cardName={userCard.scratchCard.name}
                          onComplete={() => scratchMutation.mutate(userCard.id)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't redeemed any scratch cards yet.</p>
                  <p className="text-sm text-emerald-200/60 mt-2">Go to the Scratch Cards tab to redeem one!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card nature-border leaf-pattern">
            <CardHeader>
              <CardTitle className="gradient-text text-2xl">My Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              {myCoupons && myCoupons.length > 0 ? (
                <div className="space-y-3">
                  {myCoupons.map(userCoupon => (
                    <Card key={userCoupon.id} className="glass-card nature-border hover:border-emerald-400/60 transition-all duration-300">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg gradient-text">{userCoupon.coupon.name}</h3>
                            <p className="text-sm text-emerald-200/70">{userCoupon.coupon.brandName}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={userCoupon.isUsed ? "bg-gray-600/30 border-gray-400/50 text-gray-200" : "bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-400/50"}>
                              {userCoupon.coupon.discountPercentage}% OFF
                            </Badge>
                            <p className="text-xs text-emerald-200/60 mt-1 font-medium">
                              {userCoupon.isUsed ? "✓ Used" : "✨ Available"}
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
