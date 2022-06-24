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
    AvalancheMainnet,
    AvalancheMumbai,
    BinanceMainnet,
    FantomMainnet,
    EthereumKovan,
    EthereumMainnet,
    EthereumRopsten,
    PolygonMainnet,
] as const;

const SupportedBlockchains = [
    AvalancheMainnet,
    BinanceMainnet,
    FantomMainnet,
    EthereumMainnet,
    EthereumRopsten,
    PolygonMainnet,
] as const;

/**
 * Exports
 */
// NOTE: we shouldn't need to manually sync theses types. The following approach was
// originally working, but stoped resolving for some reason. Maybe revisit after 
// upgrading typescript.
// type SupportedBlockchainIds = Extract<typeof SupportedBlockchains[number], { id }>["id"];
// type SupportedBlockchainIdAliases = Extract<typeof SupportedBlockchains[number], { id }>["idAlias"];
export type SupportedBlockchainIds =
    'avalanche-mainnet' |
    'bsc-mainnet' |
    'ethereum-mainnet' |
    'ethereum-ropsten' |
    'fantom-mainnet' |
    'polygon-mainnet';

export type SupportedBlockchainIdAliases =
    'avalanche' |
    'bsc' |
    'ethereum' |
    'fantom' |
    'polygon' |
    'ropsten';

export type SupportedBlockchainIdentifier = SupportedBlockchainIds | SupportedBlockchainIdAliases;


function findBlockchainConfig(ident: SupportedBlockchainIdentifier) {
    const blockchain = AllBlockchains.find((it) => {
        return it.id === ident || it.idAlias === ident;
    });

    if (!blockchain) {
        throw new Error(`Unsupported blockchain (${ident})`);
    }

    return blockchain;
}

function buildBaseUrl(blockchain: BlockchainDefinition): string {
    const apiDomain = blockchain.apiDomain;
    if (!apiDomain) {
        throw new Error(`Unsupported blockchain (${blockchain.id})`);
    }

    const baseUrl = 'https://' + apiDomain + '/v1';

    return baseUrl;
}


export const chainConfig: ChainConfig = SupportedBlockchains.reduce((all, blockchain) => {
    if (blockchain.contracts) {
        all[blockchain.chainId] = blockchain.contracts;
    }
    return all;
}, {});

export function resolveApiEndpointByIdentifier(ident: SupportedBlockchainIdentifier): string {
    const blockchain = findBlockchainConfig(ident);
    return buildBaseUrl(blockchain);
};

export function resolveApiEndpointByChainId(chainId: number): string {
    const blockchain = AllBlockchains.find((it) => it.chainId === chainId);
    if (!blockchain) {
        throw new Error(`Unsupported blockchain (${chainId})`);
    }
    return buildBaseUrl(blockchain);
};

// TODO: can we drop this function - it was previously exported, only used internally by APIClient
// export function chainToName(ident: SupportedBlockchainIdentifier, chainId: number): string {
//     const blockchain = findBlockchainConfig(ident);

//     if (chainId !== blockchain.chainId) {
//         throw new Error(`Unexpected chainId mismatch (${chainId}, ${blockchain.chainId})`);
//     }

//     const chainName = blockchain.chainName;

//     return chainName;
// };
