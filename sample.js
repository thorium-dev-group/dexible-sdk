import {SDK} from 'dexible-sdk';
import {ethers} from 'ethers';

const main = async () => {

    //create an SDK instance. The sdk is tied to an EVM-compatible network 
    //and the chain id within that network. 
    //Trader must link their wallet private key to sign txns and interact with orders API
    //Infura is used as the default RPC provider to do on-chain lookups.
    let dexible = new SDK({
        network: "ethereum",
        chainId: 1,
        wallet_key: process.env.WALLET_KEY,
        infuraKey: "1234567890"
    });

    
    //tokens have to be resolved on-chain by address so we get token metadata
    let tokenIn = await dexible.token.lookup({
        address: "0x1234567"
    });
    let tokenOut = await dexible.token.lookup({
        address: "0xabcdef"
    });

    
    let amountIn = ethers.utils.parseUnits("100", tokenIn.decimals);
    

    //dexible algo specs can be looked up by type. 
    //algos have a specification schema that determines the properties
    //to set for each algo. 
    let algo = await dexible.algo.create({
        type: dexible.algo.types.TWAP,
        timeWindow: "24h",
        maxRounds: 10, //min per round is 10 in tokens (100 in/10 rounds)
        priceRange: {
            basePrice: .0006, //expressed in input units per output unit (in/out)
            upperBoundPercent: 5,
            lowerBoundPercent: 5
        },
        gasPolicy: {
            type: dexible.gasPolicy.types.RELATIVE,
            deviation: 0
        },
        slippagePercent: .5
    });    

    let orderSpec = {
        tokenIn,
        tokenOut,
        amountIn,
        algo
    };

    let order = await dexible.order.create(orderSpec);

    //Querying gas tank balance example
    let gtBal = await dexible.gasTank.getBalance();

    //estimate the cost of this order AND all active orders
    let est = await dexible.order.estimateAllGas(order);

    //if the estimate is higher than balance
    if(est.gt(gtBal)) {
        //add 10% more gas than delta needed from the estimate to account for
        //10% relative gas price fluctuations
        await dexible.gasTank.deposit(est.sub(gtBal).mul(110).div(100));
    }

    //make sure dexible can spend input tokens
    let allowance = tokenIn.allowance; //await dexible.token.checkSpendAllowance(tokenIn);
    if(allowance.lt(amountIn)) {
        //if not, we need to increase. Note that this is the more expensive 
        //way of approving since every order for this token will incur fees.
        //Cheaper approach is to have some larger approval amount.

        //NOTE: we're increasing the spending vs. setting it to this order's 
        //amount. Reason is that other orders may be waiting to execute for the token
        //and we don't want to jeopardize those orders from getting paused due to inadequate
        //spend limits.
        await dexible.token.increaseSpending(tokenIn, amountIn);
    }

    //make sure the order has all the needed information
    let r = await order.verify();
    if(r.error) {
        console.log("PROBLEM WITH ORDER", r.error);
    } else {
        //optionally, you can check the estimate
        console.log("ESTIMATE", r.estimate);

        //finally, submit the estimate for execution
        await order.submit();
    }
}