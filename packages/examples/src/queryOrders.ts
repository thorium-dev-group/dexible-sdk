import {SDK} from 'dex-core';
import {ethers} from 'ethers';

const dotenv = require('dotenv');
dotenv.config();

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

    let r = await dexible.order.getAll({
        state: 'all'
    });

    console.log("Orders", r);

}

main();