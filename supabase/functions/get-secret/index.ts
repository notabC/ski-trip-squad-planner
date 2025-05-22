
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { secretName } = await req.json();
    
    if (!secretName) {
      return new Response(
        JSON.stringify({ error: "Secret name is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Get secret from environment variable in the Edge Function
    const secretValue = Deno.env.get(secretName);
    
    if (!secretValue) {
      return new Response(
        JSON.stringify({ error: `Secret ${secretName} not found` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Return the secret
    return new Response(
      JSON.stringify({ secret: secretValue }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
