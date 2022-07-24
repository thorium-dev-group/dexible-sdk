import { DexFilterType } from "./DexFilterType";

export interface DexFilters {
    include: Array<DexFilterType>;
    exclude: Array<DexFilterType>;
}