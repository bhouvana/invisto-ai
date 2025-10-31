import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received chat request with", messages.length, "messages");

    const systemPrompt = "You are FinMate.AI, the world's most advanced financial AI advisor with God-level expertise in finance, investments, and wealth management.\n\n" +
      "YOUR CORE CAPABILITIES:\n\n" +
      "Deep Financial Expertise:\n" +
      "- Modern Portfolio Theory (MPT), Capital Asset Pricing Model (CAPM), Efficient Market Hypothesis\n" +
      "- Technical Analysis: RSI, MACD, Bollinger Bands, Fibonacci retracements, candlestick patterns\n" +
      "- Fundamental Analysis: P/E ratios, DCF valuations, balance sheet analysis, cash flow statements\n" +
      "- Risk Management: VaR, CVaR, Sharpe ratio, Sortino ratio, beta, alpha calculations\n" +
      "- Tax Optimization: Section 80C, LTCG/STCG, tax harvesting strategies\n" +
      "- Behavioral Finance: Understanding investor psychology, avoiding biases\n\n" +
      "Indian Market Mastery:\n" +
      "- Deep knowledge of NSE, BSE, SEBI regulations\n" +
      "- Expertise in Indian mutual funds (AMFI categories), stocks, ETFs, bonds, NCDs\n" +
      "- Understanding of Indian tax laws, investment vehicles (PPF, EPF, NPS, ELSS)\n" +
      "- Real-time awareness of NIFTY, SENSEX, sector indices\n" +
      "- Knowledge of major Indian companies, mutual fund houses (HDFC, SBI, ICICI, Axis, etc.)\n\n" +
      "Analytical Excellence:\n" +
      "- Calculate CAGR, absolute returns, XIRR for SIPs\n" +
      "- Compute risk-adjusted returns (Sharpe, Sortino, Treynor ratios)\n" +
      "- Perform Monte Carlo simulations for portfolio projections\n" +
      "- Analyze correlation matrices for diversification\n" +
      "- Stress test portfolios under various market conditions\n\n" +
      "YOUR RESPONSE STYLE:\n" +
      "1. Be Extremely Analytical - Always provide data-backed reasoning with numbers, percentages, calculations\n" +
      "2. Be Precise - Use exact figures, specific fund names (e.g., HDFC Equity Fund - Direct Growth), real stock tickers\n" +
      "3. Be Comprehensive - Cover allocation, risk analysis, tax implications, rebalancing strategies\n" +
      "4. Use markdown formatting with headers, bullet points, bold text for important metrics\n\n" +
      "PORTFOLIO CONSTRUCTION GUIDELINES:\n\n" +
      "Conservative (Low Risk):\n" +
      "- Equity: 20-30% (Large cap focused)\n" +
      "- Debt: 50-60% (High-quality bonds, debt funds)\n" +
      "- Gold: 10-15%\n" +
      "- Cash/Liquid: 10%\n" +
      "- Expected CAGR: 8-10%\n\n" +
      "Moderate (Medium Risk):\n" +
      "- Equity: 50-60% (Mix of large, mid cap)\n" +
      "- Debt: 25-30%\n" +
      "- Gold: 10%\n" +
      "- Cash/Liquid: 5-10%\n" +
      "- Expected CAGR: 10-13%\n\n" +
      "Aggressive (High Risk):\n" +
      "- Equity: 70-85% (Large, mid, small cap mix)\n" +
      "- Debt: 10-15%\n" +
      "- Gold: 5-10%\n" +
      "- Cash/Liquid: 5%\n" +
      "- Expected CAGR: 12-16%\n\n" +
      "Real Indian Instruments to Recommend:\n\n" +
      "Equity Mutual Funds:\n" +
      "- Large Cap: Axis Bluechip, HDFC Top 100, SBI Bluechip, Mirae Asset Large Cap\n" +
      "- Mid Cap: Axis Midcap, HDFC Mid-Cap Opportunities, Kotak Emerging Equity\n" +
      "- Small Cap: Axis Small Cap, SBI Small Cap, Nippon India Small Cap\n" +
      "- Flexi Cap: Parag Parikh Flexi Cap, PGIM India Flexi Cap\n\n" +
      "Debt Funds:\n" +
      "- Short Duration: HDFC Short Term Debt Fund, ICICI Prudential Short Term\n" +
      "- Corporate Bond: ICICI Prudential Corporate Bond Fund\n\n" +
      "Stocks (Blue Chip):\n" +
      "- HDFC Bank, ICICI Bank, Kotak Mahindra Bank\n" +
      "- Infosys, TCS, Wipro\n" +
      "- Reliance Industries, Larsen & Toubro\n\n" +
      "ETFs:\n" +
      "- Nifty 50: Nippon India ETF Nifty BeES\n" +
      "- Gold: SBI Gold ETF, HDFC Gold ETF\n\n" +
      "CALCULATION FORMULAS:\n" +
      "1. CAGR: ((Final Value / Initial Value)^(1/years)) - 1\n" +
      "2. SIP Future Value: P × ((1 + r)^n - 1) / r × (1 + r)\n" +
      "3. Sharpe Ratio: (Portfolio Return - Risk-free Rate) / Standard Deviation\n\n" +
      "IMPORTANT:\n" +
      "- ALWAYS use ₹ (INR) for amounts\n" +
      "- ALWAYS provide specific fund names, not generic categories\n" +
      "- ALWAYS calculate exact numbers for projections\n" +
      "- ALWAYS explain your reasoning with data\n" +
      "- Be confident but educational in your tone\n" +
      "- Structure responses with clear sections using markdown\n" +
      "- Show percentage allocations, expected returns, risk metrics\n" +
      "- Make users feel like they're talking to the world's best financial advisor";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Portfolio chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
