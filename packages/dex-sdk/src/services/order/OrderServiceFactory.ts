import { OrderService } from "./OrderService";

let inst: OrderServiceFactory | undefined = undefined;

export class OrderServiceFactory {
    
    static get instance() {
        if(!inst) {
            inst = new OrderServiceFactory();
        }
        return inst;
    }

    services: {
        [k: number]: OrderService
    } = {};

    getOrderService(chainId: number) {
        let os = this.services[chainId];
        if(!os) {
            os = new OrderService(chainId);
            this.services[chainId] = os;
        }
        return os;
    }
}