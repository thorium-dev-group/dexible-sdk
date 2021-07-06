import {SDK, OrderSpec} from 'dex-core';
import { BigNumber, ethers} from 'ethers';
import { Token } from 'dex-token';

export interface OrderProps {
    tokenIn: Token|string;
    tokenOut: Token|string;
    amountIn: BigNumber;
    algoDetails: {
        type: string;
        params: any;
    }
}
export default class BaseOrder {
    dexible: SDK;
    orderProps: OrderProps;

    static createDexibleSDK = () => {
        let key = process.env.WALLET_KEY;
        if(!key) {
            throw new Error("Missing wallet key in env");
        }
        let infura = process.env.INFURA_PROJECT_ID;
        if(!infura) {
            throw new Error("Missing infura key in env");
        }

        console.log("Creating SDK instance");
        //create an SDK instance. The sdk is tied to an EVM-compatible network (currently only ethereum)
        //and the chain id within that network. 
        //Trader must link their wallet private key to sign txns and interact with orders API
        //Infura is used as the default RPC provider to do on-chain lookups.
        return new SDK({
            network: "ethereum",
            chainId: 42,
            signer: new ethers.Wallet(key, new ethers.providers.InfuraProvider(42, infura))
        });
    }

    constructor(props:OrderProps) {
        this.dexible = BaseOrder.createDexibleSDK();
        this.orderProps = props;
    }

    createOrder = async () => {

        //tokens have to be resolved on-chain by address so we get token metadata
        console.log("Looking up in/out tokens...");
        let tokenIn = this.orderProps.tokenIn;
        let tokenOut = this.orderProps.tokenOut;

        if(typeof this.orderProps.tokenIn === 'string') {
            tokenIn = await this.dexible.token.lookup(this.orderProps.tokenIn);
        }
        if(typeof this.orderProps.tokenOut === 'string') {
            tokenOut = await this.dexible.token.lookup(this.orderProps.tokenOut);
        }

        console.log("Creating algo...");
        let algo = await this.dexible.algo.create({
            type: this.orderProps.algoDetails.type,
            ...this.orderProps.algoDetails.params
        });    
        console.log("Algo", algo);

        //make sure dexible can spend input tokens
        let balance = (tokenIn as Token).balance;
        let amountIn = this.orderProps.amountIn;
        if(!balance || balance.lt(amountIn)) {
            throw new Error("Insufficient balance to cover trade");
        }

        let allowance = (tokenIn as Token).allowance;
        
        if(!allowance || allowance.lt(amountIn)) {
            //if not, we need to increase. Note that this is the more expensive 
            //way of approving since every order for this token will incur fees.
            //Cheaper approach is to have some larger approval amount.

            //NOTE: we're increasing the spending vs. setting it to this order's 
            //amount. Reason is that other orders may be waiting to execute for the token
            //and we don't want to jeopardize those orders from getting paused due to inadequate
            //spend limits.
            console.log("Increasing spend allowance for input token...");
            let txn = await this.dexible.token.increaseSpending({
                amount: amountIn,
                token: tokenIn as Token
            });
            console.log("Spending increased with txn hash", txn.hash);
        }

        let orderSpec = {
            tokenIn: tokenIn as Token,
            tokenOut: tokenOut as Token,
            amountIn,
            algo
        };

        console.log("Preparing order spec", orderSpec);
        return this.dexible.order.prepare(orderSpec);
    }
}