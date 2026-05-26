import { createClient } from "@supabase/supabase-js";
import { envConfig } from "../../config/env";
// Create a single supabase client for interacting with your database
export const supabase = createClient(
  envConfig.supabaseUrl,
  envConfig.supabaseServiceKey,
);
