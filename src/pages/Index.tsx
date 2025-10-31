import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <Button
            onClick={() => navigate("/chat")}
            variant="default"
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Get Started
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16">
        <HeroSection onGetStarted={() => navigate("/chat")} />
      </main>
    </div>
  );
};

export default Index;
