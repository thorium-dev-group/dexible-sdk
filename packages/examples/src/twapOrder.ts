import {SDK} from 'dex-core';
import {ethers} from 'ethers';

const dotenv = require('dotenv');
dotenv.config();

const WETH_KOVAN = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";
const DAI_KOVAN = "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa";

const main = async () => {

    let key = process.env.WALLET_KEY;
    if(!key) {
        throw new Error("Missing wallet key in env");
    }
    let infura = process.env.INFURA_PROJECT_ID;
    if(!infura) {
        throw new Error("Missing infura key in env");
    }

    console.log("Creating SDK instance");
    //create an SDK instance. The sdk is tied to an EVM-compatible network (currently only ethereum)
    //and the chain id within that network. 
    //Trader must link their wallet private key to sign txns and interact with orders API
    //Infura is used as the default RPC provider to do on-chain lookups.
    let dexible = new SDK({
        network: "ethereum",
        chainId: 42,
        walletKey: key,
        infuraKey: infura
    });

    
    //tokens have to be resolved on-chain by address so we get token metadata
    console.log("Looking up in/out tokens...");
    let tokenIn = await dexible.token.lookup(DAI_KOVAN);
    let tokenOut = await dexible.token.lookup(WETH_KOVAN);

    console.log("TokenIn Decimals", tokenIn.decimals, "Balance", tokenIn.balance?.toString(), "Allowance", tokenIn.allowance?.toString());
    let amountIn = ethers.utils.parseUnits("4400", tokenIn.decimals);
    

    //algos have a specification schema that determines the properties
    //to set for each algo. 
    console.log("Creating algo...");
    let algo = await dexible.algo.create({
        type: dexible.algo.types.TWAP,
        timeWindow: "5m",
        maxRounds: 10, //min per round is 3 input tokens (30 in/10 rounds)
        gasPolicy: {
            type: dexible.gasPolicyTypes.RELATIVE,
            deviation: 0
        },
        slippagePercent: .5
    });    
    console.log("Algo", algo);

    //make sure dexible can spend input tokens
    let balance = tokenIn.balance;
    if(!balance || balance.lt(amountIn)) {
        throw new Error("Insufficient balance to cover trade");
    }

    let allowance = tokenIn.allowance;
    
    if(!allowance || allowance.lt(amountIn)) {
        //if not, we need to increase. Note that this is the more expensive 
        //way of approving since every order for this token will incur fees.
        //Cheaper approach is to have some larger approval amount.

        //NOTE: we're increasing the spending vs. setting it to this order's 
        //amount. Reason is that other orders may be waiting to execute for the token
        //and we don't want to jeopardize those orders from getting paused due to inadequate
        //spend limits.
        console.log("Increasing spend allowance for input token...");
        let txn = await dexible.token.increaseSpending({
            amount: amountIn,
            token: tokenIn
        });
        console.log("Spending increased with txn hash", txn.hash);
    }

    let orderSpec = {
        tokenIn,
        tokenOut,
        amountIn,
        algo
    };

    console.log("Preparing order spec", JSON.stringify(orderSpec, null, 2));
    let r = await dexible.order.prepare(orderSpec);
    if(r.error) {
        console.log("Problem with order", r.error);
        throw new Error(r.error);
    } else if(!r.order) {
        throw new Error("No order in prepare response");
    } else {
        let order = r.order;
        //could check the quote estimate and make sure it's good
        console.log("Order Quote", order.quote);

        //then submit for execution
        console.log("Submitting order...");
        r = await order.submit();
        if(r.error) {
            throw new Error(r.error);
        } 
        console.log("Order result", r);
    }
}

main();