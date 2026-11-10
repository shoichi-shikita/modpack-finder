import { VIDEO_CAMPAIGN } from "../../shared/usageCampaign.js";

let campaign = "";

export function startUsageSession() {
  const params = new URLSearchParams(window.location.search);
  const taggedVisit = params.get("utm_source") === "youtube"
    && params.get("utm_campaign") === VIDEO_CAMPAIGN;

  try {
    if (taggedVisit) sessionStorage.setItem("mpf.videoCampaign", VIDEO_CAMPAIGN);
    campaign = sessionStorage.getItem("mpf.videoCampaign") === VIDEO_CAMPAIGN ? VIDEO_CAMPAIGN : "";
  } catch {
    // Keep tracking for this page when storage is unavailable.
  }
  if (taggedVisit) {
    campaign = VIDEO_CAMPAIGN;
    trackUsageEvent("campaign_landing");
  }
}

export function trackUsageEvent(eventName) {
  const params = new URLSearchParams({ event: eventName });
  if (campaign && eventName !== "outbound_click") params.set("campaign", campaign);
  void fetch(`/api/usage-event?${params}`, {
    method: "POST",
    keepalive: true,
    credentials: "omit",
    referrerPolicy: "origin",
  }).catch(() => {});
}

export function trackOutboundClick(event) {
  if (event.defaultPrevented || (event.type === "auxclick" && event.button !== 1)) return;

  const link = event.target.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download")) return;

  if ((link.protocol === "https:" || link.protocol === "http:") && link.origin !== window.location.origin) {
    trackUsageEvent("outbound_click");
  }
}
