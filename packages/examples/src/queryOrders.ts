import BaseOrder from './BaseOrder';

const dotenv = require('dotenv');
dotenv.config();

const main = async () => {

    try {
        //gnosis safe address
        let sdk = await BaseOrder.createDexibleSDK( );
        let r = await sdk.order.getAll({
            state: 'all'
        });

        console.log("Orders", JSON.stringify(r, null, 2));
    } catch (e) {
        console.log(e);
    }

}

main();