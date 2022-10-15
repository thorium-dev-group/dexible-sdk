import { ethers } from 'ethers';
import {Dexible, Networks, DexFilters, Slippage, LimitSwap, Price, GoerliDexFilter, ExecutionStatus, TWAPSwap} from '../../src';
import { units } from '../../src/common/units';
import {StaticWeb3Factory} from '../StaticWeb3Factory';
import {UNI, WETH} from '../tokens';

require("dotenv").config();

describe("TWAPSwap", function()  {
    jest.setTimeout(30000);
    it("Should submit twap order", async () => {

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

        const twap = new TWAPSwap({
            amountIn:  units.inBNETH(".1"),
            tokenIn: WETH[Networks.EthereumGoerli.chainId],
            tokenOut: UNI[Networks.EthereumGoerli.chainId],
            slippage: new Slippage(.5, false),
            timeWindowSeconds: 3600,
            priceRange: {
                basePrice: new Price({
                    inAmount: units.inBNETH(".63"),
                    inToken: WETH[Networks.EthereumGoerli.chainId],
                    outAmount: units.inBNETH("1"),
                    outToken: UNI[Networks.EthereumGoerli.chainId]
                }),
                upperBoundPercent: 5
            },
            customizations: {
                dexFilters: {
                    include: [GoerliDexFilter.SushiSwap]
                }
            }
        });

        const q = await dex.exchange.quote(twap);
        if(!q) {
            throw new Error("Expected a quote");
        }
        if(!q.rounds) {
            throw new Error("Expected rounds");
        }
        console.log(q);
        console.log(q.amountOut.toString());
        let o = await dex.exchange.swap(twap);
        console.log("Order submitted", o);
    });
})