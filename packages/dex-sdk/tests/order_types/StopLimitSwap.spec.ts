import { ethers } from 'ethers';
import {Dexible, Networks, Slippage, Price, GoerliDexFilter, StopLimitSwap} from '../../src';
import { units } from '../../src/common/units';
import {StaticWeb3Factory} from '../StaticWeb3Factory';
import {UNI, WETH} from '../tokens';

require("dotenv").config();

describe("StopLimitSwap", function()  {
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

        const limit = new StopLimitSwap({
            amountIn:  units.inBNETH(".1"),
            tokenIn: WETH[Networks.EthereumGoerli.chainId],
            tokenOut: UNI[Networks.EthereumGoerli.chainId],
            slippage: new Slippage(.5, false),
            limitPrice: new Price({
                inAmount: units.inBNETH(".68"),
                inToken: WETH[Networks.EthereumGoerli.chainId],
                outAmount: units.inBNETH("1"),
                outToken: UNI[Networks.EthereumGoerli.chainId]
            }),
            trigger: new Price({
                inAmount: units.inBNETH(".69"),
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
        console.log(q.minAmountOut.toString());
        let o = await dex.exchange.swap(limit);
        console.log("Order submitted", o);
    });
})