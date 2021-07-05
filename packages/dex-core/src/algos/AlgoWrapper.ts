
import Factory, {CommonProps, LimitProps, StopLossProps, TWAPProps} from './Factory';
import * as Algos from 'dex-algos';

export default class AlgoWrapper {
    types: {
        Market: string;
        Limit: string;
        StopLoss: string;
        TWAP: string;
    };
    factory: Factory;

    constructor() {

        this.types = {
            Market: Algos.Market.tag,
            Limit: Algos.Limit.tag,
            StopLoss: Algos.StopLoss.tag,
            TWAP: Algos.TWAP.tag
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
            case this.types.TWAP: {
                return this.factory.createTWAP(props as TWAPProps);
            }
            default: throw new Error("Unsupported algo type: " + props.type);
        }
    }
}