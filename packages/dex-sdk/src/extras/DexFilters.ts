import { SDKError } from "../common";
import { AllowedFiltersByNetwork } from "./FiltersByNetwork";

export interface DexFilters {
    include?: Array<string>;
    exclude?: Array<string>;
}

export const validateFilters = (chainId: number, dexFilters: DexFilters): void => {
    const allowed = AllowedFiltersByNetwork[chainId];
    if(dexFilters.include &&
        dexFilters.include.length > 0) {
        dexFilters.include.forEach(i => {
            if(allowed.indexOf(i) < 0) {
                throw new SDKError({
                   message: `Unsupported dex filter '${i}' for chainId ${chainId}`
                })
            }
        })
    }
}