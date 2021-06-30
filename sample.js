import {SDK} from 'dexible-sdk';
import {ethers} from 'ethers';

const main = async () => {

    //create an SDK instance. The sdk is tied to an EVM-compatible network 
    //and the chain id within that network. 
    //Trader must link their wallet private key to sign txns and interact with orders API
    //Infura is used as the default RPC provider to do on-chain lookups.
    let dexible = new SDK({
        network: "ethereum",
        chainId: 42,
        walletKey: process.env.WALLET_KEY,
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
    

    //algos have a specification schema that determines the properties
    //to set for each algo. 
    let algo = await dexible.algo.create({
        type: dexible.algo.types.TWAP,
        timeWindow: "24h",
        maxRounds: 10, //min per round is 10 input tokens (100 in/10 rounds)
        priceRange: {
            basePrice: .0006, //expressed in input units per output unit (in/out)
            upperBoundPercent: 5,
            lowerBoundPercent: 10
        },
        gasPolicy: {
            type: dexible.gasPolicyTypes.RELATIVE,
            deviation: 0
        },
        slippagePercent: .5
    });    

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

    let orderSpec = {
        tokenIn,
        tokenOut,
        amountIn,
        algo
    };

    let order = await dexible.order.prepare(orderSpec);
    if(order.error) {
        console.log("Problem with order", order.error);
    } else {
        //could check the quote estimate and make sure it's good
        console.log("Quote", order.quote);

        //then submit for execution
        await order.submit();
    }
}

main();