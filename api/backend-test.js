
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "GET only"
    });
  }

  const target = process.env.APPS_SCRIPT_URL;

  if (!target) {
    return res.status(500).json({
      ok: false,
      error: "APPS_SCRIPT_URL is missing"
    });
  }

  try {
    const response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "ping",
        payload: {}
      }),
      redirect: "follow"
    });

    const text = await response.text();

    return res.status(200).json({
      ok: true,
      httpStatus: response.status,
      contentType: response.headers.get("content-type"),
      responsePreview: text.slice(0, 500)
    });
  } catch (error) {
    console.error("Apps Script ping failed:", error);

    return res.status(502).json({
      ok: false,
      error: "Apps Script POST failed"
    });
  }
}
