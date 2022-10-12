
import Factory, {
    LimitProps, 
    StopLossProps, 
    StopLimitProps, 
    TWAPProps,
    TakeProfitProps,
    TrailingStopProps
} from './Factory';
import * as Algos from 'dexible-algos';
import { APIExtensionProps } from 'dexible-common';

export class AlgoExtension {
    types: {
        Market: string;
        Limit: string;
        StopLoss: string;
        StopLimit: string;
        TWAP: string;
        TakeProfit: string;
        TrailingStop: string;
    };
    factory: Factory;

    constructor(_props: APIExtensionProps) {

        this.types = {
            Market: Algos.Market.tag,
            Limit: Algos.Limit.tag,
            StopLoss: Algos.StopLoss.tag,
            StopLimit: Algos.StopLimit.tag,
            TWAP: Algos.TWAP.tag,
            TakeProfit: Algos.TakeProfit.tag,
            TrailingStop: Algos.TrailingStop.tag
        }
        this.factory = new Factory();
    }

    create = (props:any) : Algos.IAlgo => {
        switch(props.type) {
            case this.types.Limit: {
                return this.factory.createLimit(props as LimitProps);
            }
            case this.types.Market: {
                return this.factory.createMarket(props);
            }
            case this.types.StopLoss: {
                return this.factory.createStopLoss(props as StopLossProps);
            }
            case this.types.StopLimit: {
                return this.factory.createStopLimit(props as StopLimitProps);
            }
            case this.types.TWAP: {
                return this.factory.createTWAP(props as TWAPProps);
            }
            case this.types.TakeProfit: {
                return this.factory.createTakeProfit(props as TakeProfitProps);
            }
            case this.types.TrailingStop: {
                return this.factory.createTrailingStop(props as TrailingStopProps);
            }
            default: throw new Error("Unsupported algo type: " + props.type);
        }
    }
}
