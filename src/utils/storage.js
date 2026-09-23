// All app data is kept in localStorage so the full flow works without a backend.
// Later, these two functions can be replaced with API calls (fetch) to a real backend.

export const STORAGE_KEY = "ilm-data-v1";

export const EMPTY_DATA = { images: [], labels: [], requests: [] };

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY_DATA, ...JSON.parse(raw) } : EMPTY_DATA;
  } catch {
    return EMPTY_DATA;
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); // may throw if storage is full
}
