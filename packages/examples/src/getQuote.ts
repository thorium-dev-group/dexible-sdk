import { ethers } from 'ethers';
import BaseOrder from './BaseOrder';
import * as TOKENS from './tokens';

const dotenv = require('dotenv');
dotenv.config();


const sleep = ms => new Promise(done=>setTimeout(done, ms));

const WETH = TOKENS.WETH_KOVAN;
const DAI = TOKENS.DAI_KOVAN;

const TOKEN_IN = DAI;
const TOKEN_OUT = WETH;
const AMT = ethers.utils.parseEther("25000");

const main = async () => {

    try {
        let sdk = await BaseOrder.createDexibleSDK();
        let tokenIn = await sdk.token.lookup(TOKEN_IN);
        let tokenOut = await sdk.token.lookup(TOKEN_OUT);


        let r = await sdk.quote.getQuote({
            tokenIn,
            tokenOut,
            amountIn: AMT,
            //maxFixedGas: ethers.utils.parseUnits("10", 9).toString(),
            slippagePercent: .5
        });

        console.log("Quote", JSON.stringify(r, null, 2));
        
        console.log("Waiting a while to force JWT to expire");
        await sleep(5000);

        console.log("Running again");
        r = await sdk.quote.getQuote({
            tokenIn,
            tokenOut,
            amountIn: AMT,
            //maxFixedGas: ethers.utils.parseUnits("10", 9).toString(),
            slippagePercent: .5
        });
        
    } catch (e) {
        console.log(e);
    }
}

main();