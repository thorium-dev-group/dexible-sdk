import {Dexible, Networks, DexFilters, Slippage, LimitSwap, Price, GoerliDexFilter} from '../../src';
import { units } from '../../src/common/units';
import {StaticWeb3Factory} from '../StaticWeb3Factory';
import {UNI, WETH} from '../tokens';

require("dotenv").config();

describe("LimitQuote", function()  {
    jest.setTimeout(30000);
    it("Should get limit quote", async () => {

        const dex = new Dexible({
            web3Factory: new StaticWeb3Factory()
        });

        const limit = new LimitSwap({
            amountIn:  units.inBNETH("1"),
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
    });
})