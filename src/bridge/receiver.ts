export const BRICKS_ORIGIN = "https://app.bricks.co";

export type BridgeMessage =
  | { type: "bricks-map:properties"; fetchedAt: string; properties: unknown[] }
  | { type: "bricks-map:error"; status: number; message: string };

function parse(data: unknown): BridgeMessage | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const msg = data as Record<string, unknown>;
  if (msg.type === "bricks-map:properties" && Array.isArray(msg.properties)) {
    return {
      type: msg.type,
      fetchedAt: typeof msg.fetchedAt === "string" ? msg.fetchedAt : new Date().toISOString(),
      properties: msg.properties,
    };
  }
  if (msg.type === "bricks-map:error") {
    return {
      type: msg.type,
      status: typeof msg.status === "number" ? msg.status : 0,
      message: typeof msg.message === "string" ? msg.message : "Unknown error",
    };
  }
  return undefined;
}

/**
 * Listens for data sent by the bookmarklet from app.bricks.co. Only messages coming from the
 * window that opened this page, on the Bricks.co origin, are accepted.
 * Returns a function that stops listening.
 */
export function listenToBricks(
  onMessage: (message: BridgeMessage) => void,
  win: Window = window,
): () => void {
  const opener = win.opener as Window | null;

  const handler = (event: MessageEvent) => {
    if (event.origin !== BRICKS_ORIGIN || !opener || event.source !== opener) return;
    const message = parse(event.data);
    if (!message) return;
    opener.postMessage({ type: "bricks-map:received" }, BRICKS_ORIGIN);
    onMessage(message);
  };

  win.addEventListener("message", handler);
  if (opener) opener.postMessage({ type: "bricks-map:ready" }, BRICKS_ORIGIN);

  return () => win.removeEventListener("message", handler);
}

/** True when the page was opened by the bookmarklet and is waiting for data. */
export const openedByBookmarklet = (win: Window = window) => Boolean(win.opener);
