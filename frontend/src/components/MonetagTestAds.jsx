import { useEffect } from "react";
import useIsPremium from "../hooks/useIsPremium";

// Monetag TEST — 23 Nov to 7 Dec 2026 (2 weeks), clean formats only.
// In-Page Push zone 12332970 (nap5k.com/tag.min.js)
// Vignette Banner zone 12333045 (n6wxm.com/vignette.min.js)
// No Popunder / OnClick, no Push Notifications, no MultiTag.
// Free users only: Premium subscribers paid for "No ads", so this
// component loads nothing when useIsPremium() is true.
// The snippets are injected via DOM (not JSX <script> tags) because
// React-inserted inline scripts do not reliably execute.
const ZONES = [
  { zone: "12332970", src: "https://nap5k.com/tag.min.js" },
  { zone: "12333045", src: "https://n6wxm.com/vignette.min.js" },
];

export default function MonetagTestAds() {
  const isPremium = useIsPremium();

  useEffect(() => {
    if (isPremium) return undefined;
    const injected = [];
    for (const { zone, src } of ZONES) {
      if (document.querySelector(`script[data-zone="${zone}"]`)) continue;
      const loader = document.createElement("script");
      loader.textContent = `(function(s){s.dataset.zone='${zone}',s.src='${src}'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
      document.body.appendChild(loader);
      injected.push(loader);
    }
    return () => {
      injected.forEach((el) => el.remove());
    };
  }, [isPremium]);

  return null;
}
