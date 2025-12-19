
/**
 * Safely stringifies objects that might contain circular references.
 */
function safeJsonStringify(obj: any): string {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return '[Circular]';
      cache.add(value);
    }
    return value;
  });
}

export function saveGuestStrategy(data: any) {
  if (!data) return;
  try {
    localStorage.setItem("spades_temp_strategy", safeJsonStringify(data));
  } catch (e) {
    console.error("Failed to save guest strategy", e);
  }
}

export function loadGuestStrategy() {
  try {
    const data = localStorage.getItem("spades_temp_strategy");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading guest strategy", e);
    return null;
  }
}

export function clearGuestStrategy() {
  localStorage.removeItem("spades_temp_strategy");
}
