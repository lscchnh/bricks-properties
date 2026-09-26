import { describe, expect, it, vi } from "vitest";
import { BRICKS_ORIGIN, listenToBricks } from "../receiver";

function fakeWindow() {
  const opener = { postMessage: vi.fn() };
  const target = new EventTarget();
  const win = Object.assign(target, { opener }) as unknown as Window;
  const send = (data: unknown, origin = BRICKS_ORIGIN, source: unknown = opener) =>
    target.dispatchEvent(new MessageEvent("message", { data, origin, source: source as Window }));
  return { win, opener, send };
}

const payload = {
  type: "bricks-map:properties",
  fetchedAt: "2026-01-01T00:00:00Z",
  properties: [],
};

describe("listenToBricks", () => {
  it("tells the opener it is ready, then accepts its data", () => {
    const { win, opener, send } = fakeWindow();
    const onMessage = vi.fn();
    listenToBricks(onMessage, win);

    expect(opener.postMessage).toHaveBeenCalledWith({ type: "bricks-map:ready" }, BRICKS_ORIGIN);

    send(payload);
    expect(onMessage).toHaveBeenCalledWith(payload);
    expect(opener.postMessage).toHaveBeenCalledWith({ type: "bricks-map:received" }, BRICKS_ORIGIN);
  });

  it("ignores messages from other origins or windows", () => {
    const { win, send } = fakeWindow();
    const onMessage = vi.fn();
    listenToBricks(onMessage, win);

    send(payload, "https://evil.example");
    send(payload, BRICKS_ORIGIN, {});
    send({ type: "something-else" });
    expect(onMessage).not.toHaveBeenCalled();
  });

  it("stops listening when disposed", () => {
    const { win, send } = fakeWindow();
    const onMessage = vi.fn();
    listenToBricks(onMessage, win)();

    send(payload);
    expect(onMessage).not.toHaveBeenCalled();
  });
});
