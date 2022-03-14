import {Price} from 'dexible-common';
import {ethers} from 'ethers';
import BaseOrder from './BaseOrder';
import * as TOKENS from './tokens';

const dotenv = require('dotenv');
dotenv.config();

const DAI = TOKENS.DAI_KOVAN;
const WETH = TOKENS.WETH_KOVAN;

class LimitOrder extends BaseOrder { }

const main = async () => {

    let sdk = await LimitOrder.createDexibleSDK();
    let tokenIn = await sdk.token.lookup(DAI);
    let tokenOut = await sdk.token.lookup(WETH);

    let limit = new LimitOrder({
        trader: await sdk.apiClient.signer.getAddress(),
        tokenIn,
        tokenOut,
        amountIn: ethers.utils.parseUnits("5550", 18),
        algoDetails: {
            type: "Limit",
            params: {
                price: Price.unitsToPrice({
                    inToken: tokenIn,
                    outToken: tokenOut,
                    inUnits: 1, //dai in
                    outUnits: .00133 //WETH out
                }),
                //maxRounds: 1,
                gasPolicy: {
                    type: "relative",
                    deviation: 0
                },
                slippagePercent: .5
            }
        }
    }, sdk);

    let r = await limit.createOrder( );
    
    if(r.error) {
        console.log("Problem with order", r.error);
        throw new Error(r.error);
    } else if(!r.order) {
        throw new Error("No order in prepare response");
    } else {
        let order = r.order;
        //could check the quote estimate and make sure it's good
        console.log("Order Quote", order.quote);

        console.log("Submitting order...");
        r = await order.submit();
        if(r.error) {
            throw new Error(r.error);
        } 
        console.log("Order result", r);
    }
}

main();