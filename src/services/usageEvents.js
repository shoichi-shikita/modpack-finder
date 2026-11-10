export function trackUsageEvent(eventName) {
  void fetch(`/api/usage-event?event=${eventName}`, {
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
