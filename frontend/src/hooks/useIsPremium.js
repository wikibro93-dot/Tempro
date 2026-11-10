import { useEffect, useState } from "react";

// True when a Premium license key is stored locally. Used to hide
// sponsored placements (the PromoCard, the Monetag slots, and the Yesim
// recommendation card) for paying subscribers — "No ads" is a paid
// promise, so every ad placement must check this, not just the PromoCard.
// The CustomDomainSection dispatches "tempmail-premium-changed" whenever
// the key is set or removed, so this stays correct without a reload.
export default function useIsPremium() {
  const [isPremium, setIsPremium] = useState(() => {
    try {
      return !!localStorage.getItem("tempmail_premium_key");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        setIsPremium(!!localStorage.getItem("tempmail_premium_key"));
      } catch {
        setIsPremium(false);
      }
    };
    sync();
    window.addEventListener("tempmail-premium-changed", sync);
    return () => window.removeEventListener("tempmail-premium-changed", sync);
  }, []);

  return isPremium;
}
