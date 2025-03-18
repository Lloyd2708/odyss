import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dnowrakzwviryvkpqlzd.supabase.co";  // Remplace par ton URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRub3dyYWt6d3Zpcnl2a3BxbHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTI0MTcsImV4cCI6MjA1NjU2ODQxN30.MQy_pnkg6Gxh88qPPv3aNMF-GVy2i30vXL3v_rBmsBw";   // Remplace par ta clé anonyme

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
