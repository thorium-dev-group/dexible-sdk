
export default function(network:string, chainId:number) {
    
    /*
    if(network !== 'ethereum' && 
       network !== 'polygon' && network !== 'avalanche') {
        throw new Error("Only support ethereum, polygon, and avalanche right now");
    }
    */
    switch (network) {
        case 'ethereum':
        case 'polygon':
        case 'avalanche':
        case 'bsc':
        case 'fantom':
            break;
        default: throw new Error("Unsupported network: " + network);
    }
    
    switch(chainId) {
        case 1: return "mainnet";
        case 3: return 'ropsten';
        case 42: return "kovan";
        case 56: return 'mainnet'; //BSC
        case 137: return 'mainnet'; //POLY
        case 250: return 'opera'; //FANTOM
        case 43114: return 'mainnet'; //AVAX
        case 80001: return 'mumbai';
        default: throw new Error("Only mainnet, polygon, avalanche, BSC, fantom, ropsten, and kovan are support right now");
    }
}