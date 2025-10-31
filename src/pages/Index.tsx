import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ChatInterface } from "@/components/ChatInterface";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          {!showChat && (
            <Button
              onClick={() => setShowChat(true)}
              variant="default"
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Get Started
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className={cn("pt-16", showChat && "hidden md:block")}>
        <HeroSection onGetStarted={() => setShowChat(true)} />
      </main>

      {/* Chat overlay/sidebar */}
      {showChat && (
        <>
          {/* Mobile overlay */}
          <div className="md:hidden fixed inset-0 z-50 bg-background">
            <div className="h-full flex flex-col">
              <div className="glass border-b border-border/50 px-4 py-3 flex items-center justify-between">
                <Logo />
                <Button
                  onClick={() => setShowChat(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <ChatInterface />
            </div>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden md:block fixed right-0 top-0 bottom-0 w-[480px] z-50 glass border-l border-border/50 animate-slide-in">
            <div className="h-full flex flex-col">
              <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg">
                  Portfolio Advisor
                </h2>
                <Button
                  onClick={() => setShowChat(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <ChatInterface />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
