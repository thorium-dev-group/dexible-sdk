import {Dexible, Networks, StopLossSwap, Slippage, Price} from '../src';
import { units } from '../src/common/units';
import {StaticWeb3Factory} from './StaticWeb3Factory';
import {UNI, WETH} from './tokens';

require("dotenv").config();

describe("StopLossQuote", function()  {
    jest.setTimeout(30000);
    it("Should get stop loss quote", async () => {

        const dex = new Dexible({
            web3Factory: new StaticWeb3Factory()
        });

        const mkt = new StopLossSwap({
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

        const q = await dex.exchange.quote(mkt);
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