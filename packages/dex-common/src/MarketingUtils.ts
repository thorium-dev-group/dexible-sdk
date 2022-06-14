export interface MarketingProps {
    /**
     * (Optional) Affiliate ID
     */
     affiliateId?: string;

     /**
      * (Optional) Referrel Code
      */
     referralCode?: string;
 
     /**
      * (Optional) Promo Code
      */
     promoCode?: string; 
}

export class MarketingUtils {
    static extractMarketingProps(props: MarketingProps): MarketingProps {
        const {
            affiliateId,
            promoCode,
            referralCode,
        } = props;

        if (affiliateId) {
            MarketingUtils.validateAffiliateId(affiliateId);
        }

        if (promoCode) {
            MarketingUtils.validatePromoCode(promoCode);
        }

        if (referralCode) {
            MarketingUtils.validateReferralCode(referralCode);
        }

        // TODO: can all 3 be set at the same time?
        return {
            affiliateId,
            promoCode,
            referralCode,
        };
    }

    static validateAffiliateId(affiliateId: string) {
        // TODO
    }

    static validateReferralCode(referralCode: string) {
        // TODO
    }

    static validatePromoCode(promoCode: string) {
        // TODO
    }
}
