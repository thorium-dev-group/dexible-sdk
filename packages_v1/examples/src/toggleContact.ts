import BaseOrder from './BaseOrder';

const dotenv = require('dotenv');
dotenv.config();

const usage = () => console.log("Usage: contact_id");

const main = async () => {

    let args = process.argv.slice(2);
    if(args.length < 1) {
        usage();
        process.exit(1);
    }

    try {
        let sdk = await BaseOrder.createDexibleSDK();
        let r = await sdk.contact.toggle(+args[0]);

        console.log("Quote", JSON.stringify(r, null, 2));
    } catch (e) {
        console.log(e);
    }
}

main();