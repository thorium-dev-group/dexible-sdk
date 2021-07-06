import BaseOrder from './BaseOrder';

const dotenv = require('dotenv');
dotenv.config();

const main = async () => {

    let sdk = BaseOrder.createDexibleSDK();
    let r = await sdk.order.getAll({
        state: 'all'
    });

    console.log("Orders", JSON.stringify(r, null, 2));

}

main();