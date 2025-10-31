import { Bot, User, TrendingUp, PieChart, LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
          
          {/* Message content rendered as Markdown with GFM (tables, bold, lists) */}
          <div
            className={cn(
              "prose prose-sm max-w-none leading-relaxed",
              isUser ? "prose-invert" : "prose-slate dark:prose-invert"
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => (
                  <table className="table-auto w-full border-collapse" {...props} />
                ),
                thead: ({ node, ...props }) => (
                  <thead className="border-b" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="border-b px-3 py-2 text-left font-semibold" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border-b px-3 py-2 align-top" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-6" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-6" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="mt-4 mb-2 text-base font-semibold" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-2" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
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
