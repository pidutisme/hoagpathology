
/**
 * Hoag Pathology API bridge
 *
 * dashboard   -> Vercel
 * login       -> /api/login
 * loginState  -> /api/login-state
 * other actions -> Apps Script (temporary migration bridge)
 */

const APP_ORIGIN = "https://hoagpathology.vercel.app";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  const body =
    req.body && typeof req.body === "object"
      ? req.body
      : {};

  const action = String(body.action || "").trim();

  const payload =
    body.payload && typeof body.payload === "object"
      ? body.payload
      : {};

  try {
    // 1. Dashboard served directly by Vercel
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

      const get = (type) =>
        parts.find((part) => part.type === type)?.value || "";

      return res.status(200).json({
        ok: true,
        appName: "HOAG PATHOLOGY",
        boardTitle: "HOAG PATHOLOGY",
        version: "2.1.4",
        serverDate:
          `${get("day")} ${get("month")} ${get("year")}`,
        serverTime:
          `${get("hour")}:${get("minute")}:${get("second")} ${get("dayPeriod")}`,
        serverIso: now.toISOString(),
        timeZone: "Asia/Kuala_Lumpur"
      });
    }

    // 2. Login and session verification served by Vercel
    if (action === "login" || action === "loginState") {
      const endpoint =
        action === "login"
          ? "/api/login"
          : "/api/login-state";

      const requestBody =
        action === "login"
          ? {
              username: payload.username,
              password: payload.password
            }
          : {
              token: payload.token
            };

      const apiResponse = await fetch(
        `${APP_ORIGIN}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(requestBody),
          redirect: "error"
        }
      );

      const responseText = await apiResponse.text();

      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        console.error(
          "Authentication endpoint returned non-JSON:",
          endpoint,
          apiResponse.status
        );

        return res.status(502).json({
          ok: false,
          authenticated: false,
          error: "Authentication API returned an invalid response."
        });
      }

      return res.status(apiResponse.status).json(responseData);
    }

    // 3. Temporary forwarding for features not yet migrated
    const target = process.env.APPS_SCRIPT_URL;

    if (!target) {
      return res.status(500).json({
        ok: false,
        error: "APPS_SCRIPT_URL is missing"
      });
    }

    const appsResponse = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
      redirect: "follow"
    });

    const appsText = await appsResponse.text();

    let appsData;

    try {
      appsData = JSON.parse(appsText);
    } catch {
      console.error(
        "Apps Script returned non-JSON:",
        appsResponse.status
      );

      return res.status(502).json({
        ok: false,
        error: "Apps Script returned a non-JSON response"
      });
    }

    return res.status(200).json(appsData);

  } catch (error) {
    console.error(
      "API bridge error:",
      error?.message || "Unknown error"
    );

    return res.status(502).json({
      ok: false,
      error: "Unable to process API request"
    });
  }
}
