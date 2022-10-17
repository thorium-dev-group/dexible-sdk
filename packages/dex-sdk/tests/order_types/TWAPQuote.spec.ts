import { ethers } from 'ethers';
import { TWAPSwap } from '../../src/exchange/swap_types/TWAP';
import {Dexible, IERC20Token, Networks, Slippage} from '../../src';
import { units } from '../../src/common/units';
import {StaticWeb3Factory} from '../StaticWeb3Factory';
import {DAI, UNI, USDC, WETH} from '../tokens';

require("dotenv").config();

const sleep = async (ms) => new Promise((done)=>setTimeout(done, ms));

describe("TWAPQuote", function()  {
    jest.setTimeout(30000000);
    it("Should get twap quote", async () => {

        
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
            amountIn:  units.inBNUnits(".1", 18),
            tokenOut: UNI[Networks.EthereumGoerli.chainId],
            tokenIn: WETH[Networks.EthereumGoerli.chainId],
            slippage: new Slippage(.5, false),
            timeWindowSeconds: 86400
        });

        const q = await dex.exchange.quote(twap);
        if(!q) {
            throw new Error("Expected a quote");
        }
        if(!q.rounds) {
            throw new Error("Expected rounds");
        }
        console.log(q);
    });
})