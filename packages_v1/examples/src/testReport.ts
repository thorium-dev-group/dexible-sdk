import {ethers} from 'ethers';
import BaseOrder from './BaseOrder';

const dotenv = require('dotenv');
dotenv.config();


const DAY = 86400000;
class StopLimit extends BaseOrder {};

const main = async () => {

    let sdk = await BaseOrder.createDexibleSDK();
    const start = new Date(Date.now()-(30*DAY));
    const res = await sdk.reports.getSummary(start, new Date());
    console.log("RES", res);
};

main();