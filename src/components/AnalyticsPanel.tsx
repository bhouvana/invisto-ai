import { X, TrendingUp, PieChart, BarChart3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface AnalyticsPanelProps {
  onClose: () => void;
}

const portfolioData = [
  { name: "Equity", value: 50, color: "#3B82F6" },
  { name: "Debt", value: 30, color: "#10B981" },
  { name: "Gold", value: 10, color: "#F59E0B" },
  { name: "Cash", value: 10, color: "#6B7280" },
];

const growthData = [
  { year: "Year 1", amount: 100000 },
  { year: "Year 3", amount: 135000 },
  { year: "Year 5", amount: 180000 },
  { year: "Year 7", amount: 240000 },
  { year: "Year 10", amount: 350000 },
];

const topHoldings = [
  { name: "HDFC Equity Fund", allocation: 15, returns: 14.2 },
  { name: "SBI Bluechip Fund", allocation: 12, returns: 12.8 },
  { name: "ICICI Bank Stock", allocation: 10, returns: 16.5 },
  { name: "Infosys Stock", allocation: 8, returns: 15.3 },
  { name: "Kotak Debt Fund", allocation: 15, returns: 7.8 },
];

export function AnalyticsPanel({ onClose }: AnalyticsPanelProps) {
  return (
    <div className="w-full md:w-[480px] glass border-l border-border/50 overflow-y-auto animate-slide-in">
      <div className="sticky top-0 glass border-b border-border/50 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Portfolio Analytics</h2>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 glass border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Expected CAGR</span>
            </div>
            <p className="text-2xl font-bold text-success">11.4%</p>
          </Card>
          
          <Card className="p-4 glass border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Risk Score</span>
            </div>
            <p className="text-2xl font-bold text-primary">6.5/10</p>
          </Card>
        </div>

        {/* Allocation Chart */}
        <Card className="p-6 glass border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-accent" />
            <h3 className="font-semibold">Asset Allocation</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPie>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {portfolioData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Growth Projection */}
        <Card className="p-6 glass border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-success" />
            <h3 className="font-semibold">10-Year Growth Projection</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthData}>
              <XAxis
                dataKey="year"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--success))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--success))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">
            Projected corpus: <span className="font-bold text-success">₹3,50,000</span> from initial ₹1,00,000
          </p>
        </Card>

        {/* Top Holdings */}
        <Card className="p-6 glass border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Top Holdings</h3>
          </div>
          <div className="space-y-4">
            {topHoldings.map((holding) => (
              <div key={holding.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{holding.name}</span>
                  <span className="text-xs text-success">+{holding.returns}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={holding.allocation * 6.67} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {holding.allocation}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Analysis */}
        <Card className="p-6 glass border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-accent" />
            <h3 className="font-semibold">Risk Analysis</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Volatility</span>
              <span className="text-sm font-medium text-accent">Medium</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Diversification Score</span>
              <span className="text-sm font-medium text-success">8.2/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sharpe Ratio</span>
              <span className="text-sm font-medium text-primary">1.45</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
