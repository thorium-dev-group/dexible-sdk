import {ethers} from 'ethers';
import BaseOrder from './BaseOrder';
import * as TOKENS from './tokens';

const dotenv = require('dotenv');
dotenv.config();

const WETH = TOKENS.WETH_KOVAN;
const DAI = TOKENS.DAI_KOVAN;

class TWAP extends BaseOrder {}

const main = async () => {

    let amountIn = ethers.utils.parseEther("9");
    
    let twap = new TWAP({
        tokenIn: WETH,
        tokenOut: DAI,
        amountIn,
        algoDetails: {
            type: "TWAP",
            params: {
                timeWindow: "10m",
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