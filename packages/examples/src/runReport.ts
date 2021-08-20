import BaseOrder from './BaseOrder';

const dotenv = require('dotenv');
dotenv.config();

const usage = () => console.log("Usage: <start> <end>");

const main = async () => {

    let args = process.argv.slice(2);
    if(args.length < 1) {
        usage();
        process.exit(1);
    }

    try {
        let start = new Date(args[0]);
        let end = new Date(args[1]);
        let sdk = await BaseOrder.createDexibleSDK();
        let r = await sdk.reports.getSummary(start, end);

        console.log("Result", JSON.stringify(r, null, 2));
    } catch (e) {
        console.log(e);
    }
}

main();