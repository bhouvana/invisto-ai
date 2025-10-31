import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Shield, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Powered by Advanced AI</span>
        </div>

        {/* Main heading */}
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          <span className="text-gradient">Smart Investing</span>
          <br />
          for the Indian Dream 🇮🇳
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Get AI-powered portfolio recommendations tailored to your goals, risk appetite, and investment preferences
        </p>

        {/* CTA */}
        <Button
          onClick={onGetStarted}
          size="lg"
          className="text-lg px-8 py-6 glow animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Start Building Your Portfolio
          <TrendingUp className="ml-2 w-5 h-5" />
        </Button>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {[
            {
              icon: Target,
              title: "Goal-Based Investing",
              description: "Align your investments with your financial goals",
            },
            {
              icon: Shield,
              title: "Risk-Adjusted",
              description: "Portfolios balanced for your risk appetite",
            },
            {
              icon: TrendingUp,
              title: "Market Intelligence",
              description: "Real-time data from Indian markets",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="glass p-6 rounded-2xl hover:scale-105 transition-transform"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
