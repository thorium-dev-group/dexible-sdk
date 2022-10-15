import { ethers } from 'ethers';
import {Dexible, Networks, MarketSwap, Slippage, EthereumGoerli} from '../src';
import { units } from '../src/common/units';
import { OrderServiceFactory } from '../src/services';
import {StaticWeb3Factory} from './StaticWeb3Factory';
import {UNI, WETH} from './tokens';

require("dotenv").config();

describe("MarketQuote", function()  {
    jest.setTimeout(30000);
    it("Should get market quote", async () => {

        const traderKey = process.env.TRADER_KEY;
        if(!traderKey) {
            throw new Error("Missing TRADER_KEY in environment");
        }
        
        const wallet = new ethers.Wallet(traderKey);
        const dex = new Dexible({
            domainOverride: process.env.DOMAIN_OVERRIDE,
            web3Factory: new StaticWeb3Factory(),
            signer: wallet
        });
        const q = await dex.exchange.status(`${EthereumGoerli.chainId}:1`);

        if(!q) {
            throw new Error("Expected an order");
        }
        
        console.log(q);
    });
})