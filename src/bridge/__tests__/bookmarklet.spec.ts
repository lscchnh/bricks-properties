import { describe, expect, it, vi } from "vitest";
import { buildBookmarkletHref } from "../bookmarklet";

const SITE = "https://lscchnh.github.io/bricks-properties/";

type Json = Record<string, unknown>;

/** Runs the generated bookmarklet against fake browser globals, as if clicked on `hostname`. */
function runBookmarklet(
  routes: Record<string, { status?: number; body?: unknown }>,
  hostname = "app.bricks.co",
) {
  const code = decodeURIComponent(buildBookmarkletHref(SITE).slice("javascript:".length));
  const listeners: ((event: Json) => void)[] = [];
  const mapWindow = { postMessage: vi.fn() };
  const fakeWindow = {
    open: vi.fn(() => mapWindow),
    addEventListener: (_: string, fn: (event: Json) => void) => listeners.push(fn),
    removeEventListener: vi.fn(),
  };
  const fetch = vi.fn(async (url: string, init: RequestInit) => {
    expect(init.credentials).toBe("include");
    const route = routes[url.replace("https://api.bricks.co", "")] ?? { status: 404 };
    return new Response(JSON.stringify(route.body ?? {}), { status: route.status ?? 200 });
  });
  const alert = vi.fn();

  new Function("window", "location", "fetch", "alert", code)(
    fakeWindow,
    { hostname },
    fetch,
    alert,
  );

  const signalReady = () =>
    listeners.forEach((fn) =>
      fn({ origin: new URL(SITE).origin, source: mapWindow, data: { type: "bricks-map:ready" } }),
    );
  return { fakeWindow, mapWindow, fetch, alert, signalReady };
}

describe("bookmarklet", () => {
  it("sends owned properties with their details to the map", async () => {
    const { fakeWindow, mapWindow, signalReady } = runBookmarklet({
      "/properties?take=1000&cursor=0": {
        body: {
          properties: [
            { id: 1, investorBricks: { owned: 10 } },
            { id: 2, investorBricks: { owned: 0 } },
          ],
        },
      },
      "/properties/1": { body: { address: { fr: "Paris" }, returnOnInvestment: 6 } },
    });

    expect(fakeWindow.open).toHaveBeenCalledWith(SITE, "bricks-properties-map");
    signalReady();

    await vi.waitFor(() => expect(mapWindow.postMessage).toHaveBeenCalled());
    const [message, targetOrigin] = mapWindow.postMessage.mock.calls[0]!;
    expect(targetOrigin).toBe("https://lscchnh.github.io");
    expect(message).toMatchObject({
      type: "bricks-map:properties",
      properties: [
        { id: 1, investorBricks: { owned: 10 }, address: { fr: "Paris" }, returnOnInvestment: 6 },
      ],
    });
  });

  it("waits for the map to be ready before sending", async () => {
    const { fetch, mapWindow, signalReady } = runBookmarklet({
      "/properties?take=1000&cursor=0": { body: { properties: [] } },
    });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 10));
    expect(mapWindow.postMessage).not.toHaveBeenCalled();

    signalReady();
    expect(mapWindow.postMessage).toHaveBeenCalledOnce();
  });

  it("reports authentication errors", async () => {
    const { mapWindow, signalReady } = runBookmarklet({
      "/properties?take=1000&cursor=0": { status: 401 },
    });
    signalReady();
    await vi.waitFor(() => expect(mapWindow.postMessage).toHaveBeenCalled());
    expect(mapWindow.postMessage.mock.calls[0]![0]).toMatchObject({
      type: "bricks-map:error",
      status: 401,
    });
  });

  it("refuses to run outside app.bricks.co", () => {
    const { fakeWindow, alert } = runBookmarklet({}, "example.com");
    expect(fakeWindow.open).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalled();
  });
});
