import {Dexible, Networks} from '../src';
import {StaticWeb3Factory} from './StaticWeb3Factory';
import {USDC, WETH} from './tokens';
require("dotenv").config();

describe("SpotPrice", function()  {
    jest.setTimeout(30000);
    it("Should get spot price", async () => {

        const dex = new Dexible({
            web3Factory: new StaticWeb3Factory()
        });
        const baseToken = WETH[Networks.EthereumMainnet.chainId];
        const quoteToken = USDC[Networks.EthereumMainnet.chainId];
        const price = await dex.exchange.spotRate({
            baseToken,
            quoteToken
        });
        if(!price || !price.price) {
            throw new Error("Expected a spot price result");
        }
    });
})