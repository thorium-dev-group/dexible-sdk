import {ethers} from 'ethers';
import * as AlgoSupport from './algos';
import { CommonProps } from './algos/Factory';
import * as Algos from 'dex-algos';
import TokenSupport, * as TokenSupportTypes from './TokenSupport';

interface ConstructorProps {
    network: 'ethereum'; //for now only ethereum allowed
    chainId: number;
    walletKey: string;
    infuraKey: string;
}

class AlgoWrapper {
    types: object;
    factory: AlgoSupport.Factory;

    constructor() {
        this.types = {
            Limit: AlgoSupport.types.Limit,
            Market: AlgoSupport.types.Market,
            StopLoss: AlgoSupport.types.StopLoss,
            TWAP: AlgoSupport.types.TWAP
        };
        this.factory = new AlgoSupport.Factory();
    }

    create = (props:CommonProps) : Algos.IAlgo => {
        switch(props.type) {
            case AlgoSupport.types.Limit: {
                return this.factory.createLimit(props as AlgoSupport.FactoryTypes.LimitProps);
            }
            case AlgoSupport.types.Market: {
                return this.factory.createMarket(props);
            }
            case AlgoSupport.types.StopLoss: {
                return this.factory.createStopLoss(props as AlgoSupport.FactoryTypes.StopLossProps);
            }
            case AlgoSupport.types.TWAP: {
                return this.factory.createTWAP(props as AlgoSupport.FactoryTypes.TWAPProps);
            }
            default: throw new Error("Unsupported algo type: " + props.type);
        }
    }
}

export default class SDK {

    provider: ethers.providers.Provider;
    wallet: ethers.Wallet;
    gasPolicyTypes: object;
    algo: AlgoWrapper;
    token: TokenSupport;

    constructor(props:ConstructorProps) {
        this.provider = new ethers.providers.InfuraProvider(props.chainId, props.infuraKey);
        this.wallet = new ethers.Wallet(props.walletKey, this.provider);
        this.algo = new AlgoWrapper();
        this.token = new TokenSupport({
            provider: this.provider,
            wallet: this.wallet
        });

        this.gasPolicyTypes = {
            RELATIVE: "relative",
            FIXED: "fixed"
        }
    }
}