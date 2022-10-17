import {APIClientFactory} from '../APIClientFactory';

export interface ReportRequest {
    chainId: number;
    start: Date;
    end: Date;
}

export class ReportService {

    async getSummary(request: ReportRequest): Promise<any> {
        const {
            chainId,
            start,
            end
        } = request;

        const api = APIClientFactory.instance.getClient(chainId);
        const r =  await api.post('report/order_summary/csv', {
            startDate: Math.floor(start.getTime()/1000),
            endDate: Math.ceil(end.getTime()/1000)
        });
        return r;
    }
}