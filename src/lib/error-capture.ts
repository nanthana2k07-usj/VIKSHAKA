// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.

interface CapturedError {
  error: unknown;
  at: number;
}

const errorQueue: CapturedError[] = [];
const TTL_MS = 5_000;
const MAX_QUEUE_SIZE = 50;

function record(error: unknown) {
  if (errorQueue.length >= MAX_QUEUE_SIZE) {
    errorQueue.shift();
  }
  errorQueue.push({ error, at: Date.now() });
}

function pruneExpired() {
  const now = Date.now();
  while (errorQueue.length > 0 && now - errorQueue[0].at > TTL_MS) {
    errorQueue.shift();
  }
}

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record((event as ErrorEvent).error ?? event));
  globalThis.addEventListener("unhandledrejection", (event) =>
    record((event as PromiseRejectionEvent).reason),
  );
}

export function consumeLastCapturedError(): unknown {
  pruneExpired();
  if (errorQueue.length === 0) return undefined;
  return errorQueue.shift()!.error;
}
