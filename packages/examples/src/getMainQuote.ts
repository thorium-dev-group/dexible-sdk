import { ethers } from 'ethers';
import BaseOrder from './BaseOrder';
import * as TOKENS from './tokens';

const dotenv = require('dotenv');
dotenv.config();

const sleep = ms => new Promise(done=>setTimeout(done, ms));

const asUnits = (a, d) => {
    return ethers.utils.parseUnits(a.toFixed(d), d);
}

const INPUTS = [
    TOKENS.WETH_MAINNET,
    TOKENS.USDC_MAINNET,
    TOKENS.DAI_MAINNET
];

const OUTPUTS = [
    TOKENS.UNI_MAINNET,
    TOKENS.IFUND_MAINNET,
    TOKENS.UNI_MAINNET
];

const AMOUNTS = [
    asUnits(300, 18),
    asUnits(300000, 6),
    asUnits(300000, 18)
]

const AMT = ethers.utils.parseEther("300");

const CNT = 2;

const main = async () => {

    try {
        let sdk = await BaseOrder.createDexibleSDK();
        let tokenCache = {};

        let calls:any[]= [];
        for(let i=0;i<CNT;++i) {
            let inT = INPUTS[i%3];
            let outT = OUTPUTS[i%3];
            let amountIn = AMOUNTS[i%3];
            let tokenIn = tokenCache[inT] || (await sdk.token.lookup(inT));
            let tokenOut = tokenCache[outT] || (await sdk.token.lookup(outT));
            tokenCache[inT] = tokenIn;
            tokenCache[outT] = tokenOut;

            /*
            calls.push( sdk.quote.getQuote({
                tokenIn,
                tokenOut,
                amountIn,
                slippagePercent: .5
            }));
            */
           let r = await sdk.quote.getQuote({
                tokenIn,
                tokenOut,
                amountIn,
                slippagePercent: .5
            });
            console.log("Quote", JSON.stringify(r, null, 2));

            console.log("Waiting a while to force JWT timeout");
            await sleep(65000);

        }
        
       // let res = await Promise.all(calls);

        //console.log("Quote", JSON.stringify(res[0], null, 2));
    } catch (e) {
        console.log(e);
    }
}

main();