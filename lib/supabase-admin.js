function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const { createClient } = (supabaseUrl && supabaseServiceRoleKey)
  ? await import("@supabase/supabase-js")
  : { createClient: null };

export const supabase = (supabaseUrl && supabaseServiceRoleKey && typeof createClient === "function")
  ? createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : new Proxy({}, {
      get(_target, prop) {
        if (prop === "then") return undefined;
        return () => {
          requiredEnv("SUPABASE_URL");
          requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
        };
      }
    });
