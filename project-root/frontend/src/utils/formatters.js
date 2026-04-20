export function formatDistance(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }

  return `${Number(value).toFixed(2)} km`;
}

export function formatDuration(value) {
  if (!value && value !== 0) {
    return "N/A";
  }

  return `${Math.round(value)} min`;
}

export function formatScore(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return Number(value).toFixed(2);
}
