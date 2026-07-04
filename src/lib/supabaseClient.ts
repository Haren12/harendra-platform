/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Check environment variables safely (using Vite public configuration prefix or standard fallback)
const supabaseUrl = (typeof import.meta !== "undefined" && (import.meta as any).env ? (import.meta as any).env.VITE_SUPABASE_URL : "") || (typeof process !== "undefined" && process.env ? process.env.SUPABASE_URL : "") || "";
const supabaseAnonKey = (typeof import.meta !== "undefined" && (import.meta as any).env ? (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env.VITE_SUPABASE_ANON_KEY : "") || (typeof process !== "undefined" && process.env ? process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY : "") || "";

let supabase: SupabaseClient | null = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "https://your-project-ref.supabase.co") {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseConfigured = true;
    console.log("Supabase Enterprise Client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
} else {
  console.warn(
    "Supabase credentials not configured in environment. Defaulting to local high-fidelity mock storage."
  );
}

export { supabase, isSupabaseConfigured, supabaseUrl };
