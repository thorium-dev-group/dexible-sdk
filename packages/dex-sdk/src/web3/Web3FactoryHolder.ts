import {IWeb3Factory} from '../common/IWeb3Factory';

let inst: Web3FactoryHolder | undefined = undefined;
export class Web3FactoryHolder {

    static get instance() {
        if(!inst) {
            inst = new Web3FactoryHolder();
        }
        return inst;
    }

    factory?: IWeb3Factory;

    set factoryImpl(factory: IWeb3Factory) {
        this.factory = factory;
    }
}