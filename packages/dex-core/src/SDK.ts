import {ethers} from 'ethers';
import { AlgoWrapper} from './algos';
import TokenSupport from './TokenSupport';
import OrderWrapper from './OrderWrapper';
import {Services} from 'dex-common';

interface ConstructorProps {
    network: 'ethereum'; //for now only ethereum allowed
    chainId: number;
    walletKey: string;
    infuraKey: string;
}



export default class SDK {

    provider: ethers.providers.Provider;
    wallet: ethers.Wallet;
    gasPolicyTypes: {
        RELATIVE: string;
        FIXED: string;
    };
    algo: AlgoWrapper;
    token: TokenSupport;
    order: OrderWrapper;
    apiClient: Services.APIClient;

    constructor(props:ConstructorProps) {
        this.provider = new ethers.providers.InfuraProvider(props.chainId, props.infuraKey);
        this.wallet = new ethers.Wallet(props.walletKey, this.provider);
        this.algo = new AlgoWrapper();
        this.token = new TokenSupport({
            provider: this.provider,
            wallet: this.wallet
        });
        this.apiClient = new Services.APIClient({
            chainId: props.chainId,
            network: props.network,
            wallet: this.wallet
        });
        this.order = new OrderWrapper(this.apiClient, this.wallet);

        this.gasPolicyTypes = {
            RELATIVE: "relative",
            FIXED: "fixed"
        }
    }
}