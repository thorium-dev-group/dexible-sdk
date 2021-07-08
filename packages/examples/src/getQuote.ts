import { ethers } from 'ethers';
import BaseOrder from './BaseOrder';

const dotenv = require('dotenv');
dotenv.config();


const WETH_ROPSTEN = "0xc778417e063141139fce010982780140aa0cd5ab";
const DAI_ROPSTEN = "0xad6d458402f60fd3bd25163575031acdce07538d";

const AMT = ethers.utils.parseEther("30");

const main = async () => {

    try {
        let sdk = BaseOrder.createDexibleSDK();
        let tokenIn = await sdk.token.lookup(WETH_ROPSTEN);
        let tokenOut = await sdk.token.lookup(DAI_ROPSTEN);

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