
import {
    APIClient,
    APIExtensionProps,
} from 'dexible-common';
export class ReportExtension {
    api: APIClient;

    constructor(props: APIExtensionProps) {
        this.api = props.apiClient;
    }

    async getSummary(start:Date,end:Date) {
        return this.api.post('report/order_summary/csv', {
            startDate: Math.floor(start.getTime()/1000),
            endDate: Math.ceil(end.getTime()/1000)
        });
    }
}
