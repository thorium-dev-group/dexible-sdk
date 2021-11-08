
export default function(network:string, chainId:number) {
    if(network !== 'ethereum' && network !== 'polygon' && network !== 'avalanche') {
        throw new Error("Only support ethereum, polygon, and avalanche right now");
    }
    switch(chainId) {
        case 1: return "mainnet";
        case 3: return 'ropsten';
        case 42: return "kovan";
        case 137: return 'mainnet';
        case 43114: return 'mainnet';
        case 80001: return 'mumbai';
        default: throw new Error("Only mainnet, polygon, avalanche, ropsten, and kovan are support right now");
    }
}