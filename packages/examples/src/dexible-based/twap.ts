import { Dexible, Price, QuoteRequest} from "dexible-sdk";
import { ethers } from "ethers";
import * as tokens from '../tokens';


const TOKEN_IN = tokens.USDC_MAINNET;
const TOKEN_OUT = tokens.WETH_MAINNET;
const AMOUNT = ethers.utils.parseUnits("100000", 6);

const main = async () => {
    let key = process.env.WALLET_KEY;
    if(!key) {
        throw new Error("Missing WALLET_KEY in environment");
    }
    let dex = await Dexible.connect({
        walletKey: key
    });

    let tokens = await dex.resolveTokens({
        tokenIn: TOKEN_IN,
        tokenOut: TOKEN_OUT
    });

    let order = await dex.twap({
        trader: await dex.sdk.apiClient.signer.getAddress(),
        amountIn: AMOUNT,
        gasPolicy: {
            type: "relative"
        },
        slippagePercent: .5,
        timeWindow: {
            days: 1
        },
        tokenIn: tokens.tokenIn,
        tokenOut: tokens.tokenOut,
        randomizeDelay: true,
        priceRange: {
            basePrice: Price.unitsToPrice({
                inToken: tokens.tokenIn,
                inUnits: 1000,
                outToken: tokens.tokenOut,
                outUnits: .3
            }),
            lowerBoundPercent: 1,
            upperBoundPercent: 1
        }
    });


    //await order.submit();

    console.log("Order", JSON.stringify(order, null, 2));
}

main();