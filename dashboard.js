
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  const now = new Date();

  return res.status(200).json({
    ok: true,
    appName: "LabApp",
    boardTitle: "HOAG PATHOLOGY",
    subtitle: "SPA Single Page Application",
    version: "2.1.4",
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
    timeZone: "Asia/Kuala_Lumpur"
  });
}
