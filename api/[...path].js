
export default async function handler(req, res) {
  const target = process.env.APPS_SCRIPT_URL;

  if (!target) {
    return res.status(500).send("APPS_SCRIPT_URL is not configured");
  }

  const incoming = new URL(req.url, `https://${req.headers.host}`);
  const destination = new URL(target);

  incoming.searchParams.forEach((value, key) => {
    destination.searchParams.set(key, value);
  });

  try {
    const response = await fetch(destination.toString(), {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
      },
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : req,
      redirect: "manual",
    });

    const location = response.headers.get("location");

    if (location) {
      return res.redirect(response.status, location);
    }

    const body = Buffer.from(await response.arrayBuffer());

    res.status(response.status);
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "text/plain"
    );
    return res.send(body);
  } catch (error) {
    console.error(error);
    return res.status(502).send("Proxy request failed");
  }
}
