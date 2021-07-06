import {Price} from 'dex-common';
import {ethers} from 'ethers';
import BaseOrder from './BaseOrder';
const dotenv = require('dotenv');
dotenv.config();

const WETH_KOVAN = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";
const DAI_KOVAN = "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa";

class LimitOrder extends BaseOrder { }

const main = async () => {

    let sdk = LimitOrder.createDexibleSDK();
    let tokenIn = await sdk.token.lookup(DAI_KOVAN);
    let tokenOut = await sdk.token.lookup(WETH_KOVAN);

    let limit = new LimitOrder({
        tokenIn,
        tokenOut,
        amountIn: ethers.utils.parseUnits("100", 18),
        algoDetails: {
            type: "Limit",
            params: {
                price: Price.unitsToPrice({
                    inToken: tokenIn,
                    outToken: tokenOut,
                    inUnits: 100, //dai in
                    outUnits: .1279 //WETH out
                }),
                maxRounds: 1,
                gasPolicy: {
                    type: "relative",
                    deviation: 0
                },
                slippagePercent: .5
            }
        }
    });

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