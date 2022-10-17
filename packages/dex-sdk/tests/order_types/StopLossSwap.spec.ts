import { ethers } from 'ethers';
import {Dexible, Networks, StopLossSwap, Slippage, Price} from '../../src';
import { units } from '../../src/common/units';
import {StaticWeb3Factory} from '../StaticWeb3Factory';
import {UNI, WETH} from '../tokens';

require("dotenv").config();

describe("StopLossSwap", function()  {
    jest.setTimeout(30000);
    it("Should submit stop loss swap", async () => {

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

        const sl = new StopLossSwap({
            amountIn:  units.inBNETH(".146"),
            tokenIn: UNI[Networks.EthereumGoerli.chainId],
            tokenOut: WETH[Networks.EthereumGoerli.chainId],
            slippage: new Slippage(.5, false),
            trigger: new Price({
                inAmount: units.inBNETH("1"),
                inToken: UNI[Networks.EthereumGoerli.chainId],
                outAmount: units.inBNETH(".64"),
                outToken: WETH[Networks.EthereumGoerli.chainId]
            })
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
        let o = await dex.exchange.swap(sl);
        console.log("Order submitted", o);
    });
})