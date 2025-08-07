// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// =================================================================
//  THIS IS THE CRITICAL DEBUGGING STEP
// =================================================================
console.log("Supabase Client Init: URL loaded?", supabaseUrl);
console.log("Supabase Client Init: Key loaded?", supabaseAnonKey);
// =================================================================

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing from .env.local");
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);