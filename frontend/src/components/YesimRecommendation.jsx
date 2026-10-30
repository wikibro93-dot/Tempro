import React from 'react';
import AppIcon from './AppIcon';
import { AFFILIATE_REL, getAffiliateLink } from '../utils/affiliateLinks';
import { trackAffiliateClick } from '../utils/affiliateTracking';

const YesimRecommendation = () => {
  return (
    <div className="yesim-card mb-4">
      <div className="yesim-card-content">
        <div className="yesim-card-icon">
          <AppIcon iconClass="bi bi-shield-check" />
        </div>
        <div className="yesim-card-body">
          <h4 className="yesim-card-title">
            Optional Travel Add-On
          </h4>
          <p className="yesim-card-text">
            Need travel data or a second number too? Yesim publicly offers eSIM plans, Pay&Fly, and virtual numbers as a separate service.
          </p>
          <a
            href={getAffiliateLink('yesim', 'landing_yesim_recommendation')}
            target="_blank"
            rel={AFFILIATE_REL}
            className="btn btn-yesim-card"
            onClick={() =>
              trackAffiliateClick({
                partner: 'yesim',
                placement: 'landing_yesim_recommendation',
                href: getAffiliateLink('yesim', 'landing_yesim_recommendation'),
                source: 'landing',
              })
            }
          >
            <AppIcon iconClass="bi bi-arrow-right-circle me-2" />
            View Yesim Options
          </a>
        </div>
      </div>
    </div>
  );
};

export default YesimRecommendation;