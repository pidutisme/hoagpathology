
export default async function handler(req, res) {
  const target = process.env.APPS_SCRIPT_URL;

  if (!target) {
    return res.status(500).json({
      ok: false,
      error: "APPS_SCRIPT_URL is missing"
    });
  }

  try {
    const response = await fetch(target, {
      method: "GET",
      redirect: "follow"
    });

    return res.status(200).json({
      ok: true,
      backendStatus: response.status,
      backendContentType: response.headers.get("content-type"),
      backendReached: response.ok
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: "Unable to reach Apps Script"
    });
  }
}
