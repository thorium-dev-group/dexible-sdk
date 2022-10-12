import Multicall from '../abi/Mulitcall.json';
import {ethers} from 'ethers';

export interface MulticallProps {
    abi: Array<any>;
    method: string;
    callData: string;
    address: string;
}

export interface AggregateProps {
    calls: Array<MulticallProps>;
    provider: ethers.providers.Provider;
    mcAddress: string;
}

export const aggregate = async (props:AggregateProps):Promise<Array<any>> => {
    try {

        let mcArgs = props.calls.map(c => {
            return [c.address, c.callData];
        });

        let mcCon = new ethers.Contract(props.mcAddress, Multicall, props.provider);
        let raw = await mcCon.aggregate(mcArgs);
        let results = [];
        if(raw.returnData) {
            let data = raw.returnData;
            results = data.map((d, i) => {
                if(!d) {
                    return null;
                }
                if(d === '0x') {
                    return [0];
                }
                if(d.length < 3) {
                    return null;
                }
                let ifc = new ethers.utils.Interface(props.calls[i].abi);
                return ifc.decodeFunctionResult(props.calls[i].method, d);
            });
        }
        return results;
        
    } catch (e) {
        console.log(e);
        throw e; 
    }
}

