import { readJson, writeJson } from "./storage";

export type LatLng = { lat: number; lng: number };

const CACHE_KEY = "bricks-map:geocode-cache:v1";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
// Nominatim's usage policy allows at most one request per second.
const MIN_INTERVAL_MS = 1100;

type Cache = Record<string, LatLng | null>;

let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function queryNominatim(address: string): Promise<LatLng | null> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) await wait(MIN_INTERVAL_MS - elapsed);
  lastRequestAt = Date.now();

  const params = new URLSearchParams({ format: "jsonv2", limit: "1", q: address });
  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Nominatim answered HTTP ${response.status}`);

  const results = (await response.json()) as { lat: string; lon: string }[];
  const first = results[0];
  if (!first) return null;
  return { lat: Number.parseFloat(first.lat), lng: Number.parseFloat(first.lon) };
}

/**
 * Resolves an address to coordinates. Results (including "not found") are cached in
 * localStorage so a property is only looked up once. Network errors are not cached.
 */
export function geocode(address: string): Promise<LatLng | null> {
  const key = address.trim().toLowerCase();
  const cache = readJson<Cache>(CACHE_KEY) ?? {};
  if (key in cache) return Promise.resolve(cache[key] ?? null);

  const result = queue.then(() => queryNominatim(address));
  queue = result.catch(() => undefined);

  return result.then((coords) => {
    writeJson(CACHE_KEY, { ...(readJson<Cache>(CACHE_KEY) ?? {}), [key]: coords });
    return coords;
  });
}

export function resetGeocoderForTests() {
  lastRequestAt = 0;
  queue = Promise.resolve();
}
