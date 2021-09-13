import { ethers } from 'ethers';
import * as TOKENS from './tokens';
import Base from './BaseOrder';


const dotenv = require('dotenv');
dotenv.config();

const TOKEN_IN = TOKENS.UNI_MAINNET;
const TOKEN_OUT = TOKENS.MATIC_MAINNET;

const main = async () => {
    try {
        const sdk = await Base.createDexibleSDK();
        const [tokenIn, tokenOut] = await Promise.all([
            sdk.token.lookup(TOKEN_IN),
            sdk.token.lookup(TOKEN_OUT)
        ]);
        const spot = await sdk.quote.getSpot({tokenIn, tokenOut});
        console.log("SPOT PRICE", spot);
    } catch (e) {
        console.log(e);
    }
}

main();