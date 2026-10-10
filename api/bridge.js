
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
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
      body: JSON.stringify(req.body ?? {}),
      redirect: "follow"
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        ok: false,
        error: "Apps Script returned a non-JSON response"
      });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(data);
  } catch (error) {
    console.error("API bridge error:", error);

    return res.status(502).json({
      ok: false,
      error: "Unable to contact Apps Script"
    });
  }
}
