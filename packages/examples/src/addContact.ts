import BaseOrder from './BaseOrder';

const dotenv = require('dotenv');
dotenv.config();


const main = async () => {

    try {
        let sdk = BaseOrder.createDexibleSDK();
        let r = await sdk.contact.add("mdcoon1@yahoo.com");

        console.log("Quote", JSON.stringify(r, null, 2));
    } catch (e) {
        console.log(e);
    }
}

main();