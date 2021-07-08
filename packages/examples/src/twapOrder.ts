import {ethers} from 'ethers';
import BaseOrder from './BaseOrder';

const dotenv = require('dotenv');
dotenv.config();

const WETH_KOVAN = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";
const DAI_KOVAN = "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa";


const WETH_ROPSTEN = "0xc778417e063141139fce010982780140aa0cd5ab";
const DAI_ROPSTEN = "0xad6d458402f60fd3bd25163575031acdce07538d";

const WETH = WETH_ROPSTEN;
const DAI = DAI_ROPSTEN;

class TWAP extends BaseOrder {}

const main = async () => {

    let amountIn = ethers.utils.parseEther("30");
    
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