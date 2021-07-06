import {SDK} from 'dex-core';
import {ethers} from 'ethers';
import { Price } from 'dex-common';
import BaseOrder from './BaseOrder';

const dotenv = require('dotenv');
dotenv.config();

const WETH_KOVAN = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";
const DAI_KOVAN = "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa";

class TWAP extends BaseOrder {};

const main = async () => {

    let sdk = BaseOrder.createDexibleSDK();
    
    //tokens have to be resolved on-chain by address so we get token metadata
    console.log("Looking up in/out tokens...");
    let tokenIn = await sdk.token.lookup(DAI_KOVAN);
    let tokenOut = await sdk.token.lookup(WETH_KOVAN);

    console.log("TokenIn Decimals", tokenIn.decimals, "Balance", tokenIn.balance?.toString(), "Allowance", tokenIn.allowance?.toString());
    let amountIn = ethers.utils.parseUnits("5400", tokenIn.decimals);
    

    let twap = new TWAP({
        tokenIn,
        tokenOut,
        amountIn,
        algoDetails: {
            type: "TWAP",
            params: {
                timeWindow: "2m",
                priceRange: {
                    basePrice: Price.unitsToPrice({
                        inToken: tokenIn,
                        outToken: tokenOut,
                        inUnits: 1, //1 dai
                        outUnits: .001279 //for this amount of WETH
                    }),
                    lowerBoundPercent: 5,
                    upperBoundPercent: 2
                },
                maxRounds: 20,
                gasPolicy: {
                    type: "relative",
                    deviation: 0
                },
                slippagePercent: .5
            }
        }
    });
    
    let r = await twap.createOrder();
    if(r.error) {
        console.log("Problem with order", r.error);
        throw new Error(r.error);
    } else if(!r.order) {
        throw new Error("No order in prepare response");
    } else {
        let order = r.order;
        //could check the quote estimate and make sure it's good
        console.log("Order Quote", order.quote);

        if(order.quote.rounds === 1) {
            console.log("Single-round order quote so will not submit");
        } else {
            //then submit for execution
            console.log("Submitting order...");
            r = await order.submit();
            if(r.error) {
                throw new Error(r.error);
            } 
            console.log("Order result", r);
        }
    }
}

main();