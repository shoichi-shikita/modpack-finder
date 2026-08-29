import { useEffect, useRef } from "react";
import { SITE_CONFIG } from "../data/siteConfig";

// Reserved ad slot.
//
// Behavior:
// - Production + a real `adSlotId` given  -> renders a live AdSense unit.
// - Production + no `adSlotId`            -> renders nothing (safe before you
//                                            create ad units in AdSense).
// - Development                           -> shows a labeled placeholder box.
//
// The loader script (with your publisher ID) lives in index.html <head>, which
// is all AdSense needs for site review and for Auto ads. To place a *manual*
// unit here, create an ad unit in your AdSense dashboard, copy its numeric
// slot id, and pass it in App, e.g. <AdSlot slot="results-end" adSlotId="1234567890" />
export default function AdSlot({ slot, adSlotId }) {
  const pushed = useRef(false);
  const client = SITE_CONFIG.adsenseClient;
  const showReal = import.meta.env.PROD && !!client && !!adSlotId;

  useEffect(() => {
    if (!showReal || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not ready yet / blocked — ignore.
    }
  }, [showReal]);

  if (showReal) {
    return (
      <div className="my-5">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={adSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  if (import.meta.env.DEV) {
    return (
      <div
        className="my-5 py-6 text-center border-2 border-dashed border-stone-600 text-stone-400 text-[12px] tracking-wider uppercase"
        aria-hidden="true"
      >
        広告枠（開発プレビュー）: {slot}
      </div>
    );
  }

  return null;
}
