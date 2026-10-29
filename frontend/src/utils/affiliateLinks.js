export const AFFILIATE_LINKS = {
  hostinger: 'https://www.hostinger.com/pk?REFERRALCODE=ZKDWAQASAVSO',
  yesim: 'https://yesim.app/?partner_id=3317',
  nordvpn: 'https://go.nordvpn.net/aff_c?offer_id=15&aff_id=146034&url_id=902',
  nordpass: 'https://go.nordpass.io/aff_c?offer_id=488&aff_id=146034&url_id=9356',
};

export const AFFILIATE_REL = 'noopener noreferrer sponsored';

function sanitizePlacement(placement) {
  return String(placement || 'site')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
}

export function getAffiliateLink(partner, placement = 'site') {
  const base = AFFILIATE_LINKS[partner];
  if (!base) {
    return '#';
  }

  const safePlacement = sanitizePlacement(placement);

  try {
    const url = new URL(base);
    url.searchParams.set('utm_source', 'tempmailpro');
    url.searchParams.set('utm_medium', 'affiliate');
    url.searchParams.set('utm_campaign', safePlacement);
    return url.toString();
  } catch {
    return base;
  }
}
