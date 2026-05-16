async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function fetchHealth() {
  return request("/api/health");
}

export function fetchCategories() {
  return request("/api/categories");
}

export function fetchPois(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return request(`/api/pois${query ? `?${query}` : ""}`);
}

export function recommendRoute(payload) {
  return request("/api/recommend-route", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveRoute(payload) {
  return request("/api/routes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchSavedRoute(publicId) {
  return request(`/api/routes/${encodeURIComponent(publicId)}`);
}

export async function fetchStreetRoute(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) {
    return null;
  }

  const coordinates = waypoints
    .map((point) => `${point.lng},${point.lat}`)
    .join(";");

  const response = await fetch(
    `https://router.project-osrm.org/route/v1/foot/${coordinates}?overview=full&geometries=geojson&steps=false`,
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.routes?.length) {
    throw new Error("No se pudo calcular la ruta peatonal.");
  }

  const route = data.routes[0];

  return {
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    durationMinutes: Math.round(route.duration / 60),
    geometry: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    mode: "walking-network",
  };
}
