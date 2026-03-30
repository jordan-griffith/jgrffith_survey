import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SurveyResponse {
  id: string;
  created_at: string;
  favorite_artist: string;
  favorite_genre: string;
  hours_per_week: string;
  locations: string[];
  other_location: string | null;
}

export interface SurveyInsert {
  favorite_artist: string;
  favorite_genre: string;
  hours_per_week: string;
  locations: string[];
  other_location?: string | null;
}
