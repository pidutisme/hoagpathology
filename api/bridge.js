
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const body =
      req.body && typeof req.body === "object"
        ? req.body
        : {};

    const action = String(body.action || "").trim();

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
        serverDate: `${get("day")} ${get("month")} ${get("year")}`,
        serverTime:
          `${get("hour")}:${get("minute")}:${get("second")} ${get("dayPeriod")}`,
        serverIso: now.toISOString(),
        timeZone: "Asia/Kuala_Lumpur"
      });
    }

    return res.status(200).json({
      ok: true,
      diagnostic: true,
      action,
      message: "Bridge function is running."
    });
  } catch (error) {
    console.error("Bridge diagnostic failed:", error);

    return res.status(500).json({
      ok: false,
      error: "Bridge diagnostic failed."
    });
  }
}
