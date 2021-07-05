
export default function(network:string, chainId:number) {
    if(network !== 'ethereum') {
        throw new Error("Only support ethereum right now");
    }
    switch(chainId) {
        case 1: return "mainnet";
        case 3: return "ropsten";
        case 4: return "rinkeby";
        case 42: return "kovan";
        default: throw new Error("Only mainnet and kovan are support right now");
    }
}