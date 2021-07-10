import { ethers } from 'ethers';
import BaseOrder from './BaseOrder';
import * as TOKENS from './tokens';

const dotenv = require('dotenv');
dotenv.config();


const WETH = TOKENS.WETH_MAINNET;
const DAI = TOKENS.DAI_MAINNET;

const AMT = ethers.utils.parseEther("5550");

const main = async () => {

    try {
        let sdk = BaseOrder.createDexibleSDK();
        let tokenIn = await sdk.token.lookup(DAI);
        let tokenOut = await sdk.token.lookup(WETH);

        let r = await sdk.quote.getQuote({
            tokenIn,
            tokenOut,
            amountIn: AMT,
            slippagePercent: .5
        });

        console.log("Quote", JSON.stringify(r, null, 2));
    } catch (e) {
        console.log(e);
    }
}

main();