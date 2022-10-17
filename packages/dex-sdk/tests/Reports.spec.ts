import { ethers } from 'ethers';
import {Dexible, Networks} from '../src';
import {StaticWeb3Factory} from './StaticWeb3Factory';
require("dotenv").config();

describe("Reports", function()  {
    jest.setTimeout(30000);
    it("Should run report", async () => {

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
        const rows = await dex.reports.getSummary({
            chainId: Networks.EthereumGoerli.chainId,
            start: new Date(Date.now()-(86400000*10)),
            end: new Date()
        });
        if(!rows || rows.length === 0) {
            throw new Error("Expected rows to be returned");
        }
        console.log(rows);
    });
})