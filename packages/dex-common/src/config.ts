/**
 * Types
 */
type BlockchainDefinition = {
    apiDomain?: string;
    chainId: number;
    chainName: string;
    contracts?: ContractDefinition;
    id: string;
    idAlias?: string;
    networkName: string;
};

type ChainConfig = {
    [key: number]: ContractDefinition,
};

type ContractDefinition = {
    Multicall: string;
    Settlement: string;
}

/**
 * Blockchain Definitions
 */
const AvalancheMainnet: BlockchainDefinition = {
    apiDomain: 'avalanche.mainnet.api.dexible.io',
    chainId: 43114,
    chainName: 'mainnet',
    contracts: {
        Multicall: '0xa00fb557aa68d2e98a830642dbbfa534e8512e5f',
        Settlement: '0x46181db60480f137bbd6633b624cc0a7af2cfc76',
    },
    id: 'avalanche-mainnet',
    idAlias: 'avalanche',
    networkName: 'avalanche',
} as const;

const AvalancheMumbai: BlockchainDefinition = {
    chainId: 80001,
    chainName: 'mumbai',
    id: 'avalanche-mumbai',
    networkName: 'avalanche',
} as const;

const ArbitrumMainnet: BlockchainDefinition = {
    apiDomain: "arbitrum.mainnet.api.dexible.io",
    chainId: 42161,
    chainName: 'mainnet',
    contracts: {
        Multicall: '0xca11bde05977b3631167028862be2a173976ca11',
        Settlement: '0x3c2918430dbfc84960f554377d9d1248ab1977f0'
    },
    id: 'arbitrum-mainnet',
    idAlias: 'arbitrum',
    networkName: 'arbitrum'
}

const BinanceMainnet: BlockchainDefinition = {
    apiDomain: 'bsc.mainnet.api.dexible.io',
    chainId: 56,
    chainName: 'mainnet',
    contracts: {
        Multicall: "0x41263cba59eb80dc200f3e2544eda4ed6a90e76c",
        Settlement: "0x683927eb874937a7b0b7c76fb7ef4ad226d08785",
    },
    id: 'bsc-mainnet',
    idAlias: 'bsc',
    networkName: 'bsc',
} as const;

const FantomMainnet: BlockchainDefinition = {
    apiDomain: 'fantom.opera.api.dexible.io',
    chainId: 250,
    chainName: 'opera',
    contracts: {
        "Settlement": "0x46181db60480f137bbd6633b624cc0a7af2cfc76",
        "Multicall": "0x11473d6e641df17cd6331d45b135e35b49edbea8"
    },
    id: 'fantom-opera',
    idAlias: 'fantom',
    networkName: 'fantom',
} as const;

const EthereumKovan: BlockchainDefinition = {
    apiDomain: 'ethereum.kovan.api.dexible.io',
    chainId: 42,
    chainName: 'kovan',
    contracts: {
        Multicall: "0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a",
        Settlement: "0x147bFD9cEffcd58A2B2594932963F52B16d528b1",
    },
    id: 'ethereum-kovan',
    networkName: 'ethereum',
} as const;

const EthereumMainnet: BlockchainDefinition = {
    apiDomain: 'ethereum.mainnet.api.dexible.io',
    chainId: 1,
    chainName: 'mainnet',
    contracts: {
        Settlement: "0xad84693a21E0a1dB73ae6c6e5aceb041A6C8B6b3",
        Multicall: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
    },
    id: 'ethereum-mainnet',
    idAlias: 'ethereum',
    networkName: 'ethereum',
} as const;

const EthereumGoerli: BlockchainDefinition = {
    apiDomain: 'ethereum.goerli.api.dexible.io',
    chainId: 5,
    chainName: 'goerli',
    contracts: {
        Multicall: "0x5ba1e12693dc8f9c48aad8770482f4739beed696",
        Settlement: "0x9c2e88c5b633fd05f0ff60125a72ab82d07d0696",
    },
    id: 'ethereum-goerli',
    idAlias: 'goerli',
    networkName: 'ethereum',
} as const;

const EthereumRopsten: BlockchainDefinition = {
    apiDomain: 'ethereum.ropsten.api.dexible.io',
    chainId: 3,
    chainName: 'ropsten',
    contracts: {
        Multicall: "0x53c43764255c17bd724f74c4ef150724ac50a3ed",
        Settlement: "0x18b534C7D9261C2af0D65418309BA2ABfc4b682d",
    },
    id: 'ethereum-ropsten',
    idAlias: 'ropsten',
    networkName: 'ethereum',
} as const;

const OptimismMainnet: BlockchainDefinition = {
    apiDomain: 'optimism.mainnet.api.dexible.io',
    chainId: 10,
    chainName: 'optimism',
    contracts: {
        Multicall: '0xca11bde05977b3631167028862be2a173976ca11',
        Settlement: '0x6fee44c705aa554120bb91a9157392eedd95372c'
    },
    id: 'optimism-mainnet',
    idAlias: 'optimism',
    networkName: 'optimism'
} as const;

const PolygonMainnet: BlockchainDefinition = {
    apiDomain: 'polygon.mainnet.api.dexible.io',
    chainId: 137,
    chainName: 'mainnet',
    contracts: {
        Multicall: "0x11ce4B23bD875D7F5C6a31084f55fDe1e9A87507",
        Settlement: "0x683927Eb874937a7B0b7c76fB7Ef4aD226D08785",
    },
    id: 'polygon-mainnet',
    idAlias: 'polygon',
    networkName: 'polygon',
} as const;

const AllBlockchains = [
    ArbitrumMainnet,
    AvalancheMainnet,
    AvalancheMumbai,
    BinanceMainnet,
    FantomMainnet,
    EthereumKovan,
    EthereumMainnet,
    EthereumGoerli,
    EthereumRopsten,
    OptimismMainnet,
    PolygonMainnet,
] as const;

const SupportedBlockchains = [
    ArbitrumMainnet,
    AvalancheMainnet,
    BinanceMainnet,
    FantomMainnet,
    EthereumMainnet,
    EthereumGoerli,
    EthereumRopsten,
    OptimismMainnet,
    PolygonMainnet,
] as const;


/**
 * Exports
 */
export const chainConfig: ChainConfig = SupportedBlockchains.reduce((all, blockchain) => {
    if (blockchain.contracts) {
        all[blockchain.chainId] = blockchain.contracts;
    }
    return all;
}, {});


export function resolveApiEndpointByChainId(chainId: number): string {
    const blockchain = AllBlockchains.find((it) => it.chainId === chainId);
    if (!blockchain) {
        throw new Error(`Unsupported blockchain (${chainId})`);
    }

    const apiDomain = blockchain.apiDomain;
    if (!apiDomain) {
        throw new Error(`Unsupported blockchain (${blockchain.id})`);
    }

    const baseUrl = 'https://' + apiDomain + '/v2';

    return baseUrl;
};
