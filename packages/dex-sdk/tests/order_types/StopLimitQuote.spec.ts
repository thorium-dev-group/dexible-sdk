import {Dexible, Networks, DexFilters, Slippage, LimitSwap, Price, GoerliDexFilter, StopLimitSwap} from '../../src';
import { units } from '../../src/common/units';
import {StaticWeb3Factory} from '../StaticWeb3Factory';
import {UNI, WETH} from '../tokens';

require("dotenv").config();

describe("StopLimitQuote", function()  {
    jest.setTimeout(30000);
    it("Should get stop limit quote", async () => {

        const dex = new Dexible({
            web3Factory: new StaticWeb3Factory()
        });

        const limit = new StopLimitSwap({
            amountIn:  units.inBNETH("1"),
            tokenIn: WETH[Networks.EthereumGoerli.chainId],
            tokenOut: UNI[Networks.EthereumGoerli.chainId],
            slippage: new Slippage(.5, false),
            limitPrice: new Price({
                inAmount: units.inBNETH(".7"),
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
    });
})