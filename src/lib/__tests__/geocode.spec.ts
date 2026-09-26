import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { geocode, resetGeocoderForTests } from "../geocode";

const nominatimAnswer = (body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

describe("geocode", () => {
  beforeEach(() => {
    localStorage.clear();
    resetGeocoderForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns coordinates and caches them", async () => {
    const fetchMock = vi.fn(() => nominatimAnswer([{ lat: "48.87", lon: "2.33" }]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(geocode("Paris")).resolves.toEqual({ lat: 48.87, lng: 2.33 });
    await expect(geocode("  paris ")).resolves.toEqual({ lat: 48.87, lng: 2.33 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("caches addresses that were not found", async () => {
    const fetchMock = vi.fn(() => nominatimAnswer([]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(geocode("Nowhere")).resolves.toBeNull();
    await expect(geocode("Nowhere")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("spaces requests at least one second apart", async () => {
    const calls: number[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        calls.push(Date.now());
        return nominatimAnswer([{ lat: "1", lon: "2" }]);
      }),
    );

    const all = Promise.all([geocode("A"), geocode("B"), geocode("C")]);
    await vi.runAllTimersAsync();
    await all;

    expect(calls).toHaveLength(3);
    expect(calls[1]! - calls[0]!).toBeGreaterThanOrEqual(1000);
    expect(calls[2]! - calls[1]!).toBeGreaterThanOrEqual(1000);
  });

  it("does not cache network errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 503 }))
      .mockImplementationOnce(() => nominatimAnswer([{ lat: "1", lon: "2" }]));
    vi.stubGlobal("fetch", fetchMock);

    const first = geocode("Retry").catch((e: Error) => e.message);
    await vi.runAllTimersAsync();
    await expect(first).resolves.toMatch(/503/);

    const second = geocode("Retry");
    await vi.runAllTimersAsync();
    await expect(second).resolves.toEqual({ lat: 1, lng: 2 });
  });
});
