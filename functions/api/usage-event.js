import { VIDEO_CAMPAIGN } from "../../shared/usageCampaign.js";

const EVENTS = new Set(["mrpack_export", "outbound_click", "campaign_landing"]);

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
  const campaign = url.searchParams.get("campaign");
  const tagged = campaign === VIDEO_CAMPAIGN && eventName !== "outbound_click";
  if ((campaign !== null && !tagged) || (eventName === "campaign_landing" && !tagged)) {
    return new Response(null, { status: 400 });
  }
  if (!env.USAGE_EVENTS) return new Response(null, { status: 503 });

  env.USAGE_EVENTS.writeDataPoint({ blobs: tagged ? [eventName, VIDEO_CAMPAIGN] : [eventName] });
  return new Response(null, { status: 204 });
}
