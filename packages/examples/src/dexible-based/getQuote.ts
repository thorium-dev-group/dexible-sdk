import { Dexible, QuoteRequest} from "dexible-sdk";
import { ethers } from "ethers";
import * as tokens from '../tokens';


const TOKEN_IN = tokens.DAI_MAINNET;
const TOKEN_OUT = tokens.WETH_MAINNET;
const AMOUNT = ethers.utils.parseUnits("5", 18);

const main = async () => {
    let key = process.env.WALLET_KEY;
    if(!key) {
        throw new Error("Missing WALLET_KEY in environment");
    }
    let p = new ethers.providers.InfuraProvider(1, process.env.INFURA_PROJECT_ID);
    let dex = await Dexible.connect({
        walletKey: key,
        provider: p
    });

    let tokens = await dex.resolveTokens({
        tokenIn: TOKEN_IN,
        tokenOut: TOKEN_OUT
    });

    let q = await dex.getQuote({
        amountIn: AMOUNT,
        slippagePercent: .5,
        tokenIn: tokens.tokenIn,
        tokenOut: tokens.tokenOut,
        maxRounds: 3
    });

    console.log("Quote", JSON.stringify(q, null, 2));
;
}

main();