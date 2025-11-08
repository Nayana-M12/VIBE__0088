import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Zap, Droplet, Map, Sparkles, Gift, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary shadow-lg">
                <Leaf className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-4">
              Green Intelligence
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-2 font-display">
              Code that saves carbon
            </p>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered sustainability platform that predicts resource wastage and rewards you for eco-friendly choices
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild data-testid="button-get-started" className="min-w-[200px]">
                <a href="/signup">Get Started</a>
              </Button>
              <Button size="lg" variant="outline" asChild className="min-w-[200px]" data-testid="button-sign-in">
                <a href="/login">Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-display font-bold text-center mb-12">
          Smart Features for a Sustainable Planet
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Energy Predictor"
            description="AI-powered analysis of electricity consumption with wastage forecasts and optimization tips"
          />
          <FeatureCard
            icon={<Droplet className="w-6 h-6" />}
            title="Water Tracker"
            description="Monitor daily water usage patterns and get personalized efficiency scores"
          />
          <FeatureCard
            icon={<Map className="w-6 h-6" />}
            title="Eco Routes"
            description="Find carbon-efficient routes with real-time emissions comparisons"
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI Advisor"
            description="Get personalized sustainability tips powered by advanced AI"
          />
          <FeatureCard
            icon={<Gift className="w-6 h-6" />}
            title="Rewards System"
            description="Earn ecoBits for eco-friendly choices and redeem for scratch cards & coupons"
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Progress Tracking"
            description="Visualize your environmental impact and celebrate sustainability milestones"
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Start Your Sustainability Journey Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users making a positive impact on the planet while earning rewards
          </p>
          <Button size="lg" asChild data-testid="button-cta-login">
            <a href="/signup">Join Now - It's Free</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
