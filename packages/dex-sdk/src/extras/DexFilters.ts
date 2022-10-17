import { SDKError } from "../common";
import { AllowedFiltersByNetwork } from "./FiltersByNetwork";

export interface DexFilters {
    include?: Array<string>;
    exclude?: Array<string>;
}

export const validateFilters = (chainId: number, dexFilters: DexFilters): void => {
    if(!dexFilters) {
        return;
    }
    const allowed = AllowedFiltersByNetwork[chainId];
    if(!allowed) {
        throw new SDKError({
            message: "Unsupported network for dex filtering: " + chainId
        });
    }

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
    if(dexFilters.exclude &&
        dexFilters.exclude.length > 0) {
            dexFilters.exclude.forEach(i => {
                if(allowed.indexOf(i) < 0) {
                    throw new SDKError({
                        message: `Unsupported dex filter '${i}' for chainId ${chainId}`
                     })
                }
            })
        }
}