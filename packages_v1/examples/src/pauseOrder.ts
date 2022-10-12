import BaseOrder from './BaseOrder';

const dotenv = require('dotenv');
dotenv.config();

const usage = () => console.log("Usage: order_id");

const main = async () => {

    let args = process.argv.slice(2);
    if(args.length < 1) {
        usage();
        process.exit(1);
    }
    
    let sdk = await BaseOrder.createDexibleSDK();
    let r = await sdk.order.pause(+args[0]);

    console.log("Cancel Result", JSON.stringify(r, null, 2));
}

main();