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

        // TODO: can all affiliateId, promoCode and referralCode be set at the same time?
        return {
            affiliateId,
            promoCode,
            referralCode,
        };
    }

    static validateAffiliateId(affiliateId: string) {
        // TODO: determine affiliateId validation rules
    }

    static validateReferralCode(referralCode: string) {
        // TODO: determine referralCode validation rules
    }

    static validatePromoCode(promoCode: string) {
        // TODO: determine promoCode validation rules
    }
}
