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
    const { type, symbol } = await req.json();
    const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");
    
    if (!FINNHUB_API_KEY) {
      throw new Error("FINNHUB_API_KEY is not configured");
    }

    console.log(`Fetching market data for ${symbol} (type: ${type})`);

    let endpoint = '';
    let url = '';

    switch (type) {
      case 'quote':
        // Get stock quote
        url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
        break;
      case 'profile':
        // Get company profile
        url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
        break;
      case 'indices':
        // Get Indian market indices (NIFTY, SENSEX)
        url = `https://finnhub.io/api/v1/quote?symbol=^NSEI&token=${FINNHUB_API_KEY}`;
        break;
      default:
        throw new Error(`Unknown data type: ${type}`);
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Finnhub API error:", response.status, errorText);
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Market data fetched successfully");

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Market data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
