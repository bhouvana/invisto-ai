import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MessageBubble } from "@/components/MessageBubble";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const STORAGE_KEY = "finmate_chat_messages";
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to FinMate.AI 👋\n\nI'm your advanced AI financial advisor with deep expertise in:\n\n📊 **Portfolio Construction** - Modern portfolio theory, diversification strategies\n💹 **Market Analysis** - Technical & fundamental analysis of Indian markets\n🎯 **Risk Management** - Risk-adjusted returns, volatility analysis\n📈 **Investment Planning** - SIPs, lump sum strategies, tax optimization\n\nTo create your personalized portfolio, I need:\n\n1. **Initial Capital**: Your starting investment amount\n2. **Monthly SIP**: Regular investment you can commit\n3. **Investment Horizon**: How long you plan to invest (years)\n4. **Risk Appetite**: Conservative, Moderate, or Aggressive\n5. **Investment Tools**: Mutual Funds, Stocks, Debt Funds, Bonds, Gold ETFs\n\nShare these details, and I'll generate a data-driven portfolio with detailed analytics!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Removed sidebar analytics; CTA will show after user's query receives a reply
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Restore messages when returning from analysis or page reload
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages on change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      // best-effort persistence
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (response.status === 402) {
          toast.error("AI credits exhausted. Please add more credits.");
        }
        throw new Error("Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let line of lines) {
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || !line.trim()) continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            continue;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === "assistant") {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error("Failed to parse SSE:", e);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again or rephrase your question.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-success">AI Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 md:px-8 py-8"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass rounded-2xl p-4 max-w-[80%]">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                      <span className="text-sm text-muted-foreground">Analyzing financial data...</span>
                    </div>
                  </div>
                </div>
              )}
              {!isLoading && (messages.length > 0 && messages[messages.length-1].role === "assistant" && messages.some(m => m.role === "user")) && (
                <div className="flex justify-center">
                  <Button
                    className="glow"
                    variant="default"
                    onClick={() => navigate('/analysis', { state: { messages } })}
                  >
                    View world‑class analysis →
                  </Button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-border/50 bg-card/50 backdrop-blur-xl p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="relative flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Ask about portfolio strategies, market analysis, investment options..."
                    disabled={isLoading}
                    className="pr-12 h-12 text-base bg-background/50 border-border/50 focus:border-primary"
                  />
                  <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent animate-pulse" />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  size="lg"
                  className="px-6 h-12 glow"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Advanced AI powered by Gemini • Real-time market data • Personalized recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar analytics removed */}
      </div>
    </div>
  );
};

export default Chat;
