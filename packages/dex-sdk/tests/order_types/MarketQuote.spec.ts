import {Dexible, Networks, MarketSwap, Slippage} from '../src';
import { units } from '../src/common/units';
import {StaticWeb3Factory} from './StaticWeb3Factory';
import {UNI, WETH} from './tokens';

require("dotenv").config();

describe("MarketQuote", function()  {
    jest.setTimeout(30000);
    it("Should get market quote", async () => {

        const dex = new Dexible({
            web3Factory: new StaticWeb3Factory()
        });

        const mkt = new MarketSwap({
            amountIn:  units.inBNETH("1"),
            tokenIn: WETH[Networks.EthereumGoerli.chainId],
            tokenOut: UNI[Networks.EthereumGoerli.chainId],
            slippage: new Slippage(.5, false)
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