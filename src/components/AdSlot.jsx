import { useEffect, useRef } from "react";
import { SITE_CONFIG } from "../data/siteConfig";

// Live ads require an explicit launch setting and separately configured loader / consent.
export default function AdSlot({ slot, adSlotId }) {
  const pushed = useRef(false);
  const client = SITE_CONFIG.adsenseClient;
  const showReal = SITE_CONFIG.adsStatus === "live" && import.meta.env.PROD && !!client && !!adSlotId;

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
        className="my-5 py-6 text-center border-2 border-dashed border-stone-600 text-stone-400 text-[12px]  "
        aria-hidden="true"
      >
        広告枠（開発プレビュー）: {slot}
      </div>
    );
  }

  return null;
}
