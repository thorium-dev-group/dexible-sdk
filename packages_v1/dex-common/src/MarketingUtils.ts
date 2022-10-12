import SDKError from "./SDKError";

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

        return {
            affiliateId,
            promoCode,
            referralCode,
        };
    }

    static validateAffiliateId(affiliateId: string) {
        if (typeof affiliateId !== 'string') {
            throw new SDKError(`affiliateId must be a string`);
        }
        
        if (affiliateId.length < 1) {
            throw new SDKError(`affiliateId cannot be empty`);
        }

        // TODO: determine affiliateId validation rules
    }

    static validateReferralCode(referralCode: string) {
        if (typeof referralCode !== 'string') {
            throw new SDKError(`referralCode must be a string`);
        }

        if (referralCode.length < 1) {
            throw new SDKError(`referralCode cannot be empty`);
        }

        // TODO: determine referralCode validation rules
    }

    static validatePromoCode(promoCode: string) {
        if (typeof promoCode !== 'string') {
            throw new SDKError(`promoCode must be a string`);
        }

        if (promoCode.length < 1) {
            throw new SDKError(`promoCode cannot be empty`);
        }
        
        // TODO: determine promoCode validation rules
    }
}
