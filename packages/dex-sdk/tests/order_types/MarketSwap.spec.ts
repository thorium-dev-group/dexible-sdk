import { ethers } from 'ethers';
import {Dexible, Networks, MarketSwap, Slippage, ExecutionStatus} from '../../src';
import { units } from '../../src/common/units';
import {StaticWeb3Factory} from '../StaticWeb3Factory';
import {DAI, UNI, USDC, WETH} from '../tokens';

require("dotenv").config();

const sleep = async (ms) => new Promise((done)=>setTimeout(done, ms));

describe("MarketSwap", function()  {
    jest.setTimeout(30000000);
    it("Should get market quote and submit swap", async () => {

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

        const mkt = new MarketSwap({
            amountIn:  units.inBNUnits(".1", 18),
            tokenOut: UNI[Networks.EthereumGoerli.chainId],
            tokenIn: WETH[Networks.EthereumGoerli.chainId],
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
        let o = await dex.exchange.swap(mkt);
        console.log("Order submitted", o);
        let cnt = 0;
        while(o.status !== ExecutionStatus.COMPLETED) {
            await sleep(1000);
            o = await dex.exchange.status(o.id);
            console.log("Status", o.status);
            console.log("Txn", o.transactions[0]?.hash);
            ++cnt;
            if(cnt === 10) {
                cnt = 0;
                console.log("Still waiting on order", o.id);
            }
        }
    });
})