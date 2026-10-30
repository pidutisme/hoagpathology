import { supabase } from "./supabase-admin.js";

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function clean(value, max = 3000) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, max);
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function asList(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  return Object.entries(value).map(([id, row]) => ({
    ...(row && typeof row === "object" ? row : {}),
    id: row?.id || id
  }));
}

export async function getUser(userId) {
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("user_id", clean(userId, 60).toUpperCase())
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function getSettings() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("settings")
    .eq("id", "true")
    .maybeSingle();

  if (error) throw error;

  return data?.settings || {};
}

export async function saveSettings(settings) {
  const { error } = await supabase
    .from("app_settings")
    .upsert(
      {
        id: "true",
        settings: asObject(settings),
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );

  if (error) throw error;
}

export async function getRoster() {
  const { data, error } = await supabase
    .from("app_roster")
    .select("*")
    .eq("id", "team")
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function saveRoster(roster, userId, expectedVersion) {
  const current = await getRoster();

  if (
    expectedVersion !== undefined &&
    expectedVersion !== null &&
    current &&
    Number(current.version || 0) !== Number(expectedVersion)
  ) {
    return {
      committed: false,
      conflict: true,
      current
    };
  }

  const now = new Date().toISOString();

  const next = {
    id: "team",
    version: 2,
    scope: "team",
    updated_by: clean(userId, 60),
    saved_keys: Object.keys(asObject(roster)).length,
    updated_at: now,
    roster: asObject(roster)
  };

  const { error } = await supabase
    .from("app_roster")
    .upsert(next, { onConflict: "id" });

  if (error) throw error;

  return {
    committed: true,
    current: next
  };
}

export async function getInventory() {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("deleted", false)
    .order("id");

  if (error) throw error;

  return data || [];
}

export async function getInventoryRoot() {
  const { data, error } = await supabase
    .from("app_inventory")
    .select("*")
    .eq("id", "root")
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function getOutsourceRecords() {
  const { data, error } = await supabase
    .from("outsource_records")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getTransfusionRecords() {
  const { data, error } = await supabase
    .from("transfusion_records")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getSystemLogs(limit = 250) {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 250, 1),
    1000
  );

  const { data, error } = await supabase
    .from("system_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) throw error;

  return data || [];
}

export async function deleteSession(tokenHash) {
  const { error } = await supabase
    .from("app_sessions")
    .delete()
    .eq("token_hash", tokenHash);

  if (error) throw error;

  return true;
}

export async function appendSystemLog(entry) {
  const at = String(
    entry?.at || new Date().toISOString()
  );

  const { error } = await supabase
    .from("system_logs")
    .insert({
      id: crypto.randomUUID(),
      data: {
        ...entry,
        at
      },
      created_at: at
    });

  if (error) throw error;

  return true;
}

export { asList, asObject, clean, fail };