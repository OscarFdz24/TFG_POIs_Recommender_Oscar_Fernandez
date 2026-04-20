export function sanitizeText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  const text = String(value).trim();
  if (!text) {
    return "";
  }

  if (/Ã|â|Ê|ð/.test(text)) {
    try {
      return Buffer.from(text, "latin1").toString("utf8");
    } catch {
      return text;
    }
  }

  return text;
}

export function toSlug(value) {
  return sanitizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
