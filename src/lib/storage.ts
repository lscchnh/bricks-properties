// localStorage can be unavailable (private mode, blocked site data): never let it break the app.

export function readJson<T>(key: string): T | undefined {
  try {
    const value = localStorage.getItem(key);
    return value === null ? undefined : (JSON.parse(value) as T);
  } catch {
    return undefined;
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: the data simply won't be remembered.
  }
}

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignored, see above.
  }
}
