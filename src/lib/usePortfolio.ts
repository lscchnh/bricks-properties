import { computed, ref, shallowRef } from "vue";
import { geocode } from "./geocode";
import { isLocated, normalizeProperty, type Property } from "./property";
import { readJson, removeKey, writeJson } from "./storage";
import type { BridgeMessage } from "@/bridge/receiver";

const SNAPSHOT_KEY = "bricks-map:snapshot:v1";

type Snapshot = { fetchedAt: string; properties: Property[] };
export type Status = "empty" | "waiting" | "geocoding" | "ready" | "error";

export function usePortfolio() {
  const saved = readJson<Snapshot>(SNAPSHOT_KEY);
  const properties = shallowRef<Property[]>(saved?.properties ?? []);
  const fetchedAt = ref<string | undefined>(saved?.fetchedAt);
  const status = ref<Status>(saved ? "ready" : "empty");
  const error = ref<string>();
  const geocodingProgress = ref({ done: 0, total: 0 });

  const located = computed(() => properties.value.filter(isLocated));
  const unlocated = computed(() => properties.value.filter((p) => !isLocated(p)));
  const totalBricks = computed(() => properties.value.reduce((sum, p) => sum + p.bricksOwned, 0));

  function save() {
    if (fetchedAt.value) {
      writeJson(SNAPSHOT_KEY, { fetchedAt: fetchedAt.value, properties: properties.value });
    }
  }

  async function locateMissing() {
    const missing = properties.value.filter((p) => !isLocated(p));
    geocodingProgress.value = { done: 0, total: missing.length };
    if (missing.length > 0) status.value = "geocoding";

    for (const property of missing) {
      try {
        const coords = await geocode(property.address);
        if (coords) {
          properties.value = properties.value.map((p) =>
            p.id === property.id ? { ...p, ...coords } : p,
          );
        }
      } catch (e) {
        console.warn(`Could not geocode "${property.address}"`, e);
      }
      geocodingProgress.value = {
        ...geocodingProgress.value,
        done: geocodingProgress.value.done + 1,
      };
    }
    save();
    status.value = "ready";
  }

  async function receive(message: BridgeMessage) {
    if (message.type === "bricks-map:error") {
      status.value = "error";
      error.value =
        message.status === 401 || message.status === 403
          ? "Bricks.co refused the request: make sure you are logged in on app.bricks.co, then click the bookmark again."
          : `Could not read your properties from Bricks.co (${message.message}).`;
      return;
    }

    error.value = undefined;
    properties.value = message.properties
      .map(normalizeProperty)
      .filter((p): p is Property => p !== undefined && p.bricksOwned > 0);
    fetchedAt.value = message.fetchedAt;
    save();
    await locateMissing();
  }

  function waitForBricks() {
    status.value = "waiting";
  }

  function clear() {
    removeKey(SNAPSHOT_KEY);
    properties.value = [];
    fetchedAt.value = undefined;
    error.value = undefined;
    status.value = "empty";
  }

  return {
    properties,
    located,
    unlocated,
    totalBricks,
    fetchedAt,
    status,
    error,
    geocodingProgress,
    receive,
    locateMissing,
    waitForBricks,
    clear,
  };
}
