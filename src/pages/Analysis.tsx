import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  LineChart as RLineChart,
  Line,
  PieChart as RPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useMemo, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

type LocationState = {
  messages?: Message[];
};

function parseInputs(messages: Message[]) {
  const text = messages.map((m) => m.content).join("\n\n");

  const initial = /₹\s?([\d,]+)\s*(lakhs|lakh|cr|crore)?|initial\s*capital[^\d]*₹([\d,]+)/i.exec(text);
  let initialCapital = 1000000;
  if (initial) {
    const raw = (initial[1] || initial[3] || "").replace(/[,\s]/g, "");
    let num = parseFloat(raw || "0");
    if (initial[2] && /cr|crore/i.test(initial[2])) num = num * 10000000;
    if (initial[2] && /lakh|lakhs/i.test(initial[2])) num = num * 100000;
    if (!isNaN(num) && num > 0) initialCapital = num;
  }

  const sipMatch = /monthly\s*(sip|investment)[^\d]*₹\s*([\d,]+)/i.exec(text);
  const monthlySIP = sipMatch ? parseInt(sipMatch[2].replace(/[,\s]/g, "")) : 25000;

  const horizonMatch = /(\d+)\s*(years|year|yrs)/i.exec(text);
  const years = horizonMatch ? parseInt(horizonMatch[1]) : 10;

  // Allocation extraction e.g., Equity 65%, Debt 20%, Gold 10%, Cash 5%
  const alloc: Record<string, number> = { Equity: 60, Debt: 25, Gold: 10, Cash: 5 };
  const allocRegex = /(Equity|Debt|Gold|Cash)[^\d%]*([\d\.]+)\s?%/gi;
  let m: RegExpExecArray | null;
  while ((m = allocRegex.exec(text))) {
    alloc[m[1]] = parseFloat(m[2]);
  }

  // Ensure totals ~100
  const total = alloc.Equity + alloc.Debt + alloc.Gold + alloc.Cash;
  if (Math.abs(total - 100) > 1) {
    const scale = 100 / total;
    alloc.Equity = Math.round(alloc.Equity * scale * 10) / 10;
    alloc.Debt = Math.round(alloc.Debt * scale * 10) / 10;
    alloc.Gold = Math.round(alloc.Gold * scale * 10) / 10;
    alloc.Cash = Math.round(alloc.Cash * scale * 10) / 10;
  }

  return { initialCapital, monthlySIP, years, allocation: alloc };
}

function projectGrowth(initial: number, sip: number, years: number, annualRate: number) {
  const months = years * 12;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  const series: { month: number; year: string; corpus: number }[] = [];
  let value = initial;
  for (let i = 1; i <= months; i++) {
    value = value * (1 + monthlyRate) + sip;
    if (i % 12 === 0) {
      const y = i / 12;
      series.push({ month: i, year: `Year ${y}`, corpus: Math.round(value) });
    }
  }
  return series;
}

function computeRiskMetrics(series: { corpus: number }[], annualReturn: number) {
  // Simple heuristics: infer volatility from allocation blend and growth slope
  // Not a backtest; gives directional guidance only.
  const monthlyRate = Math.pow(1 + annualReturn, 1 / 12) - 1;
  const volatilityAnnual = Math.max(0.06, Math.min(0.25, monthlyRate * 12 * 1.2));
  const riskFree = 0.0725; // India 10Y approx
  const sharpe = (annualReturn - riskFree) / volatilityAnnual;
  const beta = Math.min(1.3, Math.max(0.6, annualReturn / 0.12));
  return { volatilityAnnual, sharpe, beta };
}

function parseTopHoldings(messages: Message[]) {
  const text = messages.filter(m => m.role === "assistant").map(m => m.content).join("\n");
  // Patterns like "Axis Bluechip Fund - Direct Growth: ₹..." or "Axis Bluechip Fund ... (15%)"
  const lineRegex = /(Axis\b[^\n]*|HDFC\b[^\n]*|ICICI\b[^\n]*|SBI\b[^\n]*|Kotak\b[^\n]*|Nippon\b[^\n]*|Parag\b[^\n]*|Tata\b[^\n]*|Reliance\b[^\n]*|Infosys\b[^\n]*|HDFC Bank\b[^\n]*)/gi;
  const percentRegex = /([\d\.]+)\s?%/;
  const results: { name: string; weight: number }[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = lineRegex.exec(text))) {
    const raw = match[1].trim();
    const name = raw.replace(/[*\-:•]/g, " ").replace(/\s+/g, " ").trim();
    if (seen.has(name)) continue;
    const p = percentRegex.exec(raw);
    const weight = p ? parseFloat(p[1]) : 0;
    results.push({ name, weight });
    seen.add(name);
    if (results.length >= 10) break;
  }
  // Normalize weights if missing
  const hasWeights = results.some(r => r.weight > 0);
  if (!hasWeights && results.length) {
    const equal = Math.round((100 / results.length) * 10) / 10;
    return results.map(r => ({ ...r, weight: equal }));
  }
  const total = results.reduce((s, r) => s + (r.weight || 0), 0);
  if (total > 0) {
    return results.map(r => ({ ...r, weight: Math.round((r.weight / total) * 1000) / 10 }));
  }
  return results;
}

export default function Analysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const messages = state.messages || [];

  const parsed = useMemo(() => parseInputs(messages), [messages]);
  const [allocation, setAllocation] = useState(parsed.allocation);
  const [initialCapital, setInitialCapital] = useState(parsed.initialCapital);
  const [monthlySIP, setMonthlySIP] = useState(parsed.monthlySIP);
  const [years, setYears] = useState(parsed.years);

  // Expected annual returns by asset class (editable)
  const [expected, setExpected] = useState({ Equity: 0.155, Debt: 0.07, Gold: 0.06, Cash: 0.04 });

  const blendedAnnual = useMemo(() => (
    (allocation.Equity / 100) * expected.Equity +
    (allocation.Debt / 100) * expected.Debt +
    (allocation.Gold / 100) * expected.Gold +
    (allocation.Cash / 100) * expected.Cash
  ), [allocation, expected]);

  const series = useMemo(() => projectGrowth(initialCapital, monthlySIP, years, blendedAnnual), [initialCapital, monthlySIP, years, blendedAnnual]);

  const allocChart = [
    { name: "Equity", value: allocation.Equity, color: "#3B82F6" },
    { name: "Debt", value: allocation.Debt, color: "#10B981" },
    { name: "Gold", value: allocation.Gold, color: "#F59E0B" },
    { name: "Cash", value: allocation.Cash, color: "#6B7280" },
  ];

  const finalCorpus = series.length ? series[series.length - 1].corpus : initialCapital;
  const holdings = useMemo(() => parseTopHoldings(messages), [messages]);
  const risk = useMemo(() => computeRiskMetrics(series, blendedAnnual), [series, blendedAnnual]);

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h1 className="font-display text-xl font-semibold">World‑Class Portfolio Analysis</h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Interactive charts powered by your inputs</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 glass"><div className="text-xs text-muted-foreground">Initial Capital</div><div className="text-2xl font-bold">₹{initialCapital.toLocaleString()}</div></Card>
          <Card className="p-5 glass"><div className="text-xs text-muted-foreground">Monthly SIP</div><div className="text-2xl font-bold">₹{monthlySIP.toLocaleString()}</div></Card>
          <Card className="p-5 glass"><div className="text-xs text-muted-foreground">Horizon</div><div className="text-2xl font-bold">{years} years</div></Card>
          <Card className="p-5 glass"><div className="text-xs text-muted-foreground">Projected Corpus</div><div className="text-2xl font-bold text-success">₹{finalCorpus.toLocaleString()}</div><div className="text-xs text-muted-foreground">Blended expected return: {(blendedAnnual*100).toFixed(1)}%</div></Card>
        </div>

        {/* Allocation + Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 glass border-border/50">
            <div className="flex items-center gap-2 mb-4"><PieChart className="w-4 h-4 text-accent" /><h3 className="font-semibold">Asset Allocation</h3></div>
            <ResponsiveContainer width="100%" height={320}>
              <RPieChart>
                <Pie data={allocChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {allocChart.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </RPieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 glass border-border/50">
            <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-success" /><h3 className="font-semibold">Projected Growth</h3></div>
            <ResponsiveContainer width="100%" height={320}>
              <RLineChart data={series}>
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${Math.round(v/1000)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => [`₹${Math.round(v).toLocaleString()}`, "Corpus"]} />
                <Line type="monotone" dataKey="corpus" stroke="hsl(var(--success))" strokeWidth={3} dot={{ r: 3, fill: "hsl(var(--success))" }} />
              </RLineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Interactive controls */}
        <Card className="p-6 glass border-border/50">
          <h3 className="font-semibold mb-4">Interactive Allocation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(["Equity","Debt","Gold","Cash"] as const).map(key => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-2"><span>{key}</span><span>{allocation[key]}%</span></div>
                <Slider value={[allocation[key]]} max={100} step={1} onValueChange={(v) => {
                  const next = { ...allocation, [key]: v[0] } as typeof allocation;
                  const total = next.Equity + next.Debt + next.Gold + next.Cash;
                  // Normalize to 100 by scaling others if total > 100
                  if (total !== 100) {
                    const keys = (["Equity","Debt","Gold","Cash"] as const).filter(k => k !== key);
                    const remaining = 100 - next[key];
                    const sumOthers = keys.reduce((s,k)=>s+allocation[k],0);
                    keys.forEach(k => { next[k] = Math.max(0, Math.round((allocation[k]/sumOthers)*remaining)); });
                    const fix = 100 - (next.Equity + next.Debt + next.Gold + next.Cash);
                    if (fix !== 0) next.Cash = Math.max(0, next.Cash + fix);
                  }
                  setAllocation(next);
                }} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={() => setAllocation(parsed.allocation)}>Reset Allocations</Button>
          </div>
        </Card>

        {/* Expected returns editing */}
        <Card className="p-6 glass border-border/50">
          <h3 className="font-semibold mb-4">Expected Annual Returns (edit to match your view)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            {(["Equity","Debt","Gold","Cash"] as const).map(k => (
              <div key={k} className="space-y-1">
                <div className="text-muted-foreground">{k}</div>
                <input
                  className="w-full bg-background/50 border border-border/50 rounded px-3 py-2"
                  type="number"
                  step="0.1"
                  value={(expected[k]*100).toFixed(1)}
                  onChange={(e)=> setExpected({ ...expected, [k]: Math.max(0, parseFloat(e.target.value || '0'))/100 })}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Top holdings parsed from response */}
        {holdings.length > 0 && (
          <Card className="p-6 glass border-border/50">
            <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-primary" /><h3 className="font-semibold">Top Holdings (parsed)</h3></div>
            <div className="space-y-4">
              {holdings.slice(0,10).map(h => (
                <div key={h.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{h.name}</span>
                    <span className="text-xs text-muted-foreground">{h.weight}%</span>
                  </div>
                  <div className="h-2 rounded bg-muted">
                    <div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, h.weight)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Risk metrics */}
        <Card className="p-6 glass border-border/50">
          <h3 className="font-semibold mb-4">Risk Metrics (estimated)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Volatility (annualized)</div>
              <div className="text-2xl font-bold">{(risk.volatilityAnnual*100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
              <div className="text-2xl font-bold">{risk.sharpe.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Beta vs. NIFTY 50</div>
              <div className="text-2xl font-bold">{risk.beta.toFixed(2)}</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Heuristic estimates for planning; not historical backtests.</p>
        </Card>

        {/* Notes */}
        <Card className="p-6 glass border-border/50">
          <h3 className="font-semibold mb-2">Assumptions</h3>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Projection uses blended expected return from Equity/Debt/Gold/Cash inputs.</li>
            <li>Allocations parsed from the conversation; you can refine them in your prompt.</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}


