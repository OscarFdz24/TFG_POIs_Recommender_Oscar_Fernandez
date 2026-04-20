export function getHealth(_req, res) {
  res.json({
    status: "ok",
    service: "barcelona-pois-backend",
    timestamp: new Date().toISOString(),
  });
}
