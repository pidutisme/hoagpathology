import { createRequire } from "node:module";
import { ensureRequestId } from "../lib/request-security.js";

const require = createRequire(import.meta.url);
const VERSION = require("../package.json").version;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  ensureRequestId(req, res);

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
      requestId: req.requestId
    });
  }

  const now = new Date();

  return res.status(200).json({
    ok: true,
    appName: "LabPortal - Laboratory Management System",
    boardTitle: "HOAG PATHOLOGY",
    subtitle: "Single Page Application",
    version: VERSION,
    serverIso: now.toISOString(),
    serverDate: new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kuala_Lumpur",
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(now),
    serverTime: new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kuala_Lumpur",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }).format(now),
    timeZone: "Asia/Kuala_Lumpur",
    requestId: req.requestId
  });
}