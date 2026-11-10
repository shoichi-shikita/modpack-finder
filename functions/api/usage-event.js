const EVENTS = new Set(["mrpack_export", "outbound_click"]);

export function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  const url = new URL(request.url);
  if (request.headers.get("Origin") !== url.origin) {
    return new Response(null, { status: 403 });
  }

  const eventName = url.searchParams.get("event");
  if (!EVENTS.has(eventName)) return new Response(null, { status: 400 });
  if (!env.USAGE_EVENTS) return new Response(null, { status: 503 });

  env.USAGE_EVENTS.writeDataPoint({ blobs: [eventName] });
  return new Response(null, { status: 204 });
}
