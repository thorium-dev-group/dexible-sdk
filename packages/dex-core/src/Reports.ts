
import {Services, Tag, Token} from 'dexible-common';
export default class Reports {
    api: Services.APIClient;

    constructor(api:Services.APIClient) {
        this.api = api;
    }

    async getSummary(start:Date,end:Date) {
        return this.api.post('report/order_summary/csv', {
            startDate: Math.floor(start.getTime()/1000),
            endDate: Math.ceil(end.getTime()/1000)
        });
    }
}