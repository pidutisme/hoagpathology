
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

  try {
    const body =
      req.body && typeof req.body === "object"
        ? req.body
        : {};

    const action = String(body.action || "");
    const payload =
      body.payload && typeof body.payload === "object"
        ? body.payload
        : {};

    // Route login directly to the new Vercel API.
    if (action === "login") {
      const response = await fetch(
        new URL("/api/login", `https://${req.headers.host}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: payload.username,
            password: payload.password
          })
        }
      );

      const data = await response.json();

      return res.status(response.status).json(data);
    }

    // Route session verification directly to Vercel.
    if (action === "loginState") {
      const response = await fetch(
        new URL("/api/login-state", `https://${req.headers.host}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: payload.token
          })
        }
      );

      const data = await response.json();

      return res.status(response.status).json(data);
    }

    // All other actions continue to use Apps Script.
    const target = process.env.APPS_SCRIPT_URL;

    if (!target) {
      return res.status(500).json({
        ok: false,
        error: "APPS_SCRIPT_URL is missing"
      });
    }

    const response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
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

    return res.status(200).json(data);
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
