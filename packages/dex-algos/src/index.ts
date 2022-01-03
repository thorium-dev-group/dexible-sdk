import {default as IAlgo} from './IAlgo';
import {default as Limit, LimitParams} from './Limit';
import {default as Market, MarketParams} from './Market';
import {default as StopLoss, StopLossParams} from './StopLoss';
import {default as TWAP, TWAPParams} from './TWAP';
import {default as StopLimit, StopLimitParams} from './StopLimit';

const types = {
    Limit: Limit.tag,
    Market: Market.tag,
    StopLoss: StopLoss.tag,
    TWAP: TWAP.tag,
    StopLimit: StopLimit.tag
}

export {
    types,
    IAlgo,
    Limit, LimitParams,
    Market, MarketParams,
    StopLoss, StopLossParams,
    TWAP, TWAPParams,
    StopLimit, StopLimitParams
}