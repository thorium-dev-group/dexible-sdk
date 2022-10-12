import { Dexible} from "dexible-sdk";
import {ethers} from 'ethers';

const DAY = 86400000;
const main = async () => {
    let key = process.env.WALLET_KEY;
    if(!key) {
        throw new Error("Missing WALLET_KEY in environment");
    }
    let p = new ethers.providers.InfuraProvider(1, process.env.INFURA_PROJECT_ID);
    let dex = await Dexible.connect({
        walletKey: key,
        provider: p
    });
    let now = Date.now();

    let r = await dex.sdk.reports.getSummary(new Date(now-(7*DAY)), new Date(now));

    console.log("Summary", JSON.stringify(r, null, 2));
;
}

main();