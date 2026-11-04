
export default function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    ok: true,
    service: "Hoag Pathology API",
    platform: "Vercel"
  });
}
