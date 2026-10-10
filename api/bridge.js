/**
 * Hoag Pathology API bridge
 * - dashboard: served by Vercel
 * - login/loginState: served by the migrated Vercel endpoints
 * - other actions: temporarily forwarded to Apps Script while migration continues
 */
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const action = String(body.action || "").trim();
  const payload = body.payload && typeof body.payload === "object" ? body.payload : {};

  try {
    if (action === "dashboard") {
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kuala_Lumpur",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).formatToParts(now);
      const get = (type) => parts.find((part) => part.type === type)?.value || "";
      return res.status(200).json({
        ok: true,
        appName: "HOAG PATHOLOGY",
        boardTitle: "HOAG PATHOLOGY",
        version: "2.1.4",
        serverDate: `${get("day")} ${get("month")} ${get("year")}`,
        serverTime: `${get("hour")}:${get("minute")}:${get("second")} ${get("dayPeriod")}`,
        serverIso: now.toISOString(),
        timeZone: "Asia/Kuala_Lumpur"
      });
    }

    // Use Vercel's deployment hostname to call the migrated API routes.
    // VERCEL_URL is provided by Vercel and does not include the protocol.
    if (action === "login" || action === "loginState") {
      const deploymentHost = process.env.VERCEL_URL || req.headers.host;
      if (!deploymentHost) {
        return res.status(500).json({ ok: false, authenticated: false, error: "Vercel deployment host is unavailable." });
      }
      const endpoint = action === "login" ? "/api/login" : "/api/login-state";
      const apiResponse = await fetch(`https://${deploymentHost}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "login"
          ? { username: payload.username, password: payload.password }
          : { token: payload.token })
      });
      const responseText = await apiResponse.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        return res.status(502).json({ ok: false, authenticated: false, error: "Authentication API returned an invalid response." });
      }
      return res.status(apiResponse.status).json(responseData);
    }

    // Temporary compatibility bridge for features not migrated from Apps Script yet.
    const target = process.env.APPS_SCRIPT_URL;
    if (!target) {
      return res.status(500).json({ ok: false, error: "APPS_SCRIPT_URL is missing" });
    }

    const response = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow"
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ ok: false, error: "Apps Script returned a non-JSON response" });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error("API bridge error:", error?.message || "Unknown error");
    return res.status(502).json({ ok: false, error: "Unable to process API request" });
  }
}
