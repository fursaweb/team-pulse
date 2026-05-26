import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!PORT) {
  throw new Error("PORT is not defined");
}

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is not defined");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_KEY is not defined");
}

if (!supabasePublishableKey) {
  throw new Error("SUPABASE_PUBLISHABLE_KEY is not defined");
}

export const envConfig = {
  port: PORT,
  supabaseUrl,
  supabaseServiceKey,
  supabasePublishableKey,
};
