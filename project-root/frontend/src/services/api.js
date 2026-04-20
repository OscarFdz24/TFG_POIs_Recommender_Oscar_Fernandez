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

export function recommendRoute(payload) {
  return request("/api/recommend-route", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
