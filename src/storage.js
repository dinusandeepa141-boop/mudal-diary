// Standalone replacement for the Claude-artifact "window.storage" API.
// Uses the phone's local storage so data persists between app opens,
// fully offline, with no server involved.

const PREFIX = "mudal-diary:";

async function get(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return null;
    return { key, value: raw, shared: false };
  } catch (e) {
    return null;
  }
}

async function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, value);
    return { key, value, shared: false };
  } catch (e) {
    return null;
  }
}

async function del(key) {
  try {
    localStorage.removeItem(PREFIX + key);
    return { key, deleted: true, shared: false };
  } catch (e) {
    return null;
  }
}

async function list(prefix = "") {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + prefix)) keys.push(k.slice(PREFIX.length));
    }
    return { keys, prefix, shared: false };
  } catch (e) {
    return null;
  }
}

export const storage = { get, set, delete: del, list };
