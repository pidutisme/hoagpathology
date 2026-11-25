import { ensureRequestId } from "../lib/request-security.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  ensureRequestId(req, res);

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
      requestId: req.requestId
    });
  }

  res.setHeader("Content-Type", "application/json");
  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  return res.status(200).json({
    ok: true,
    service: "LabPortal - Laboratory Management System API",
    platform: "Vercel",
    requestId: req.requestId
  });
}
