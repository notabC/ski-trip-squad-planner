
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = "https://tgbvkiumuqqdczupkoje.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYnZraXVtdXFxZGN6dXBrb2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODYzNzUsImV4cCI6MjA2MzM2MjM3NX0.Pdf0RXErYBwQQ_qkqozUCVxhHctnAYOSe5F1kyCDs_o";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
