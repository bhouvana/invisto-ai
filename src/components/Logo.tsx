import { Sparkles } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <span className="text-xl font-bold text-white">₹</span>
        </div>
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent" />
      </div>
      <span className="font-display font-bold text-xl">
        <span className="text-gradient">FinMate</span>.AI
      </span>
    </div>
  );
}
