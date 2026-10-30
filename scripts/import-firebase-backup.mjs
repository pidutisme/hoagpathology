import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path) {
  const text = fs.readFileSync(path, "utf8");
  const env = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();

    env[key] = value;
  }

  return env;
}

const env = loadEnv(".env");

if (!env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL tidak dijumpai dalam .env");
}

if (!env.SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_SECRET_KEY tidak dijumpai dalam .env");
}

const backup = JSON.parse(
  fs.readFileSync("firebase-full-backup.json", "utf8")
);

if (!backup.labapp) {
  throw new Error("Root labapp tidak dijumpai dalam backup.");
}

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SECRET_KEY
);

const { error } = await supabase
  .from("firebase_migration_backup")
  .insert({
    source_name: "firebase-labapp",
    data: backup.labapp
  });

if (error) {
  throw error;
}

console.log("Firebase backup berjaya dimasukkan ke Supabase staging table.");
console.log("Root:", Object.keys(backup));