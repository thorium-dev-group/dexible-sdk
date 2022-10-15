import {default as IAlgo} from './IAlgo';
import {default as Limit, LimitAlgoParams} from './Limit';
import {default as Market, MarketAlgoParams} from './Market';
import {default as StopLoss, StopLossAlgoParams} from './StopLoss';
import {default as TWAP, TWAPAlgoParams} from './TWAP';
import {default as StopLimit, StopLimitAlgoParams} from './StopLimit';
import {default as TakeProfit, TakeProfitAlgoParams} from './TakeProfit';
import {default as TrailingStop, TrailingStopAlgoParams} from './TrailingStop';

const types = {
    Limit: Limit.tag,
    Market: Market.tag,
    StopLoss: StopLoss.tag,
    TWAP: TWAP.tag,
    StopLimit: StopLimit.tag,
    TakeProfit: TakeProfit.tag,
    TrailingStop: TrailingStop.tag
}

export {
    types,
    IAlgo,
    Limit, LimitAlgoParams,
    Market, MarketAlgoParams,
    StopLoss, StopLossAlgoParams,
    TWAP, TWAPAlgoParams,
    StopLimit, StopLimitAlgoParams,
    TakeProfit, TakeProfitAlgoParams,
    TrailingStop, TrailingStopAlgoParams
}