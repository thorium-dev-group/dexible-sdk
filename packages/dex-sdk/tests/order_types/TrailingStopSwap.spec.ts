import { ethers } from 'ethers';
import {Dexible, Networks, Slippage,  TrailingStopSwap} from '../../src';
import { units } from '../../src/common/units';
import {StaticWeb3Factory} from '../StaticWeb3Factory';
import {UNI, WETH} from '../tokens';

require("dotenv").config();

describe("TrailingStopSwap", function()  {
    jest.setTimeout(30000);
    it("Should submit trailing stop", async () => {

        const traderKey = process.env.TRADER_KEY;
        if(!traderKey) {
            throw new Error("Missing TRADER_KEY in environment");
        }
        
        const wallet = new ethers.Wallet(traderKey);
        const dex = new Dexible({
            domainOverride: process.env.DOMAIN_OVERRIDE,
            signer: wallet,
            web3Factory: new StaticWeb3Factory()
        });

        const sl = new TrailingStopSwap({
            amountIn:  units.inBNETH(".146"),
            tokenIn: UNI[Networks.EthereumGoerli.chainId],
            tokenOut: WETH[Networks.EthereumGoerli.chainId],
            slippage: new Slippage(.5, false),
            spotPercentage: 10,
        });

        const q = await dex.exchange.quote(sl);
        if(!q) {
            throw new Error("Expected a quote");
        }
        if(!q.rounds) {
            throw new Error("Expected rounds");
        }
        console.log(q);
        console.log(q.minAmountOut.toString());
        const o = await dex.exchange.swap(sl);
        console.log("Order submitted", o);
    });
})