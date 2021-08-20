import {ethers} from 'ethers';
import BaseOrder from './BaseOrder';
import * as TOKENS from './tokens';

const dotenv = require('dotenv');
dotenv.config();

const WETH = TOKENS.WETH_KOVAN;
const DAI = TOKENS.DAI_KOVAN;

const TOKEN_IN = DAI;
const TOKEN_OUT = WETH;
const AMT_IN = ethers.utils.parseEther("5950");

class TWAP extends BaseOrder {}

const main = async () => {
    let sdk = await BaseOrder.createDexibleSDK();
    let twap = new TWAP({
        tokenIn: TOKEN_IN,
        tokenOut: TOKEN_OUT,
        amountIn: AMT_IN,
        algoDetails: {
            type: "TWAP",
            params: {
                timeWindow: {
                    minutes: 6
                },
                //maxRounds: 10, //min per round is 3 input tokens (30 in/10 rounds)
                gasPolicy: {
                    type: "relative",
                    deviation: 0
                },
                slippagePercent: .5
            }
        },
        tags: [
            {
                name: "client_order_id",
                value: "abcd-efgh-ijkl"
            },
            {
                name: "test",
                value: 'true'
            }
        ]
    }, sdk);

    let r = await twap.createOrder();
    if(r.error) {
        console.log("Problem with order", r.error);
        throw new Error(r.error);
    } else if(!r.order) {
        throw new Error("No order in prepare response");
    } else {
        let order = r.order;
        //could check the quote estimate and make sure it's good
        console.log("Order", JSON.stringify(order, null, 2));

        if(order.quote.rounds === 1) {
            console.log("Single-round order quote so will not submit");
        } else {
            //then submit for execution
            console.log("Quote", JSON.stringify(order.quote, null, 2));
            
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