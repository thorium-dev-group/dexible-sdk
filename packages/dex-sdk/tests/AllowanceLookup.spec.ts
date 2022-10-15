import { ethers } from "ethers";
import { Dexible } from "../src";
import { Networks } from "../src/common";
import { StaticWeb3Factory } from "./StaticWeb3Factory";
import { USDC } from "./tokens";
require("dotenv").config();



describe("AllowanceLookup", function() {
    jest.setTimeout(30000);

    it("Should get allowance info for trader", async () => {
       
        const dex = new Dexible({
            web3Factory: new StaticWeb3Factory()
        });
        
        const traderKey = process.env.TRADER_KEY;
        if(!traderKey) {
            throw new Error("Missing TRADER_KEY in environment");
        }
        
        const wallet = new ethers.Wallet(traderKey);
        
        const token = USDC[Networks.EthereumMainnet.chainId];
        const spend = await dex.getSpendAllowance(token, await wallet.getAddress());
        
        if(!spend || spend.eq(0)) {
            throw new Error("Expected to have spend allowance");
        }
    })
})