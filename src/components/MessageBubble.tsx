import { Bot, User, TrendingUp, PieChart, LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  
  // Check if message contains portfolio data indicators
  const hasPortfolioData = message.content.includes("%") || 
                           message.content.includes("₹") || 
                           message.content.includes("CAGR");
  
  return (
    <div
      className={cn(
        "flex gap-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <Card
        className={cn(
          "max-w-[85%] md:max-w-[75%] rounded-2xl transition-all hover:shadow-lg",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-primary/20"
            : "glass border-border/50"
        )}
      >
        <div className="p-5">
          {/* Assistant message header with icons */}
          {!isUser && hasPortfolioData && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <PieChart className="w-3 h-3" />
                  <span>Portfolio Analysis</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <div className="flex items-center gap-1">
                  <LineChart className="w-3 h-3" />
                  <span>Projections</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Risk Analysis</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Message content with enhanced formatting */}
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser ? "prose-invert" : "prose-slate dark:prose-invert"
          )}>
            <div className="whitespace-pre-wrap leading-relaxed">
              {message.content.split('\n').map((line, i) => {
                // Highlight numbers and percentages
                const highlightedLine = line
                  .replace(/(\d+\.?\d*%)/g, '<span class="font-bold text-accent">$1</span>')
                  .replace(/(₹[\d,]+)/g, '<span class="font-bold text-success">$1</span>')
                  .replace(/(\d+\.?\d*\s*CAGR)/gi, '<span class="font-bold text-primary">$1</span>');
                
                // Bold headers (lines ending with :)
                if (line.trim().endsWith(':') && line.trim().length > 3) {
                  return <p key={i} className="font-semibold text-base mt-4 mb-2" dangerouslySetInnerHTML={{ __html: highlightedLine }} />;
                }
                
                // Bullet points
                if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                  return <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: highlightedLine }} />;
                }
                
                // Numbered lists
                if (/^\d+\./.test(line.trim())) {
                  return <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: highlightedLine }} />;
                }
                
                return line.trim() ? (
                  <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: highlightedLine }} />
                ) : (
                  <br key={i} />
                );
              })}
            </div>
          </div>
        </div>
      </Card>
      
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/90 flex items-center justify-center shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
