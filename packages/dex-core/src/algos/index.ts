import * as Algos from 'dex-algos';
import Factory, * as FactoryTypes from './Factory';

export const types = {
    Market: Algos.Market.tag,
    Limit: Algos.Limit.tag,
    StopLoss: Algos.StopLoss.tag,
    TWAP: Algos.TWAP.tag,
}

export {
    Factory,
    FactoryTypes
}