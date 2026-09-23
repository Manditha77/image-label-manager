export function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Text for a label, e.g. "#2 Speaker button" or "#2 (unnamed)"
export function labelText(label) {
  return `#${label.number} ${label.name || "(unnamed)"}`;
}

// Short description of where a label is: "Point · 30%, 20%" or "Area · 25% × 10%"
export function describeMark(label) {
  const pct = (v) => `${Math.round(v * 100)}%`;
  if (label.area) return { type: "Area", text: `${pct(label.area.w)} × ${pct(label.area.h)}` };
  return { type: "Point", text: `x ${pct(label.x)}, y ${pct(label.y)}` };
}
