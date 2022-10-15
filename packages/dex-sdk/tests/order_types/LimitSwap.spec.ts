import { ethers } from 'ethers';
import {Dexible, Networks, DexFilters, Slippage, LimitSwap, Price, GoerliDexFilter, ExecutionStatus} from '../src';
import { units } from '../src/common/units';
import {StaticWeb3Factory} from './StaticWeb3Factory';
import {UNI, WETH} from './tokens';

require("dotenv").config();

describe("LimitQuote", function()  {
    jest.setTimeout(30000);
    it("Should get limit quote", async () => {

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

        const limit = new LimitSwap({
            amountIn:  units.inBNETH(".1"),
            tokenIn: WETH[Networks.EthereumGoerli.chainId],
            tokenOut: UNI[Networks.EthereumGoerli.chainId],
            slippage: new Slippage(.5, false),
            price: new Price({
                inAmount: units.inBNETH(".65"),
                inToken: WETH[Networks.EthereumGoerli.chainId],
                outAmount: units.inBNETH("1"),
                outToken: UNI[Networks.EthereumGoerli.chainId]
            }),
            customizations: {
                dexFilters: {
                    include: [GoerliDexFilter.SushiSwap]
                }
            }
        });

        const q = await dex.exchange.quote(limit);
        if(!q) {
            throw new Error("Expected a quote");
        }
        if(!q.rounds) {
            throw new Error("Expected rounds");
        }
        console.log(q);
        console.log(q.amountOut.toString());
        let o = await dex.exchange.swap(limit);
        console.log("Order submitted", o);
    });
})