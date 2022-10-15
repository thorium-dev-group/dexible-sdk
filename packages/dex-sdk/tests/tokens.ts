import {IERC20Token, Networks} from '../src/common';

export const USDC = {
    [Networks.EthereumMainnet.chainId]: {
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        decimals: 6,
        symbol: "USDC",
        name: "USD Coin",
        chainId: Networks.EthereumMainnet.chainId
    } as IERC20Token,
    [Networks.AvalancheMainnet.chainId]: {
        address: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
        decimals: 6,
        symbol: "USDC.e",
        name: "USD Coin",
        chainId: Networks.AvalancheMainnet.chainId
    },
    [Networks.ArbitrumMainnet.chainId]: {
        address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        decimals: 6,
        symbol: "USDC",
        name: "USD Coint",
        chainId: Networks.ArbitrumMainnet.chainId
    }
}

export const DAI = {
    [Networks.AvalancheMainnet.chainId]: {
        address: "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
        decimals: 18,
        symbol: "DAI",
        name: "DAI",
        chainId: Networks.AvalancheMainnet.chainId
    }
}

export const WETH = {
    [Networks.EthereumMainnet.chainId]: {
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped ETH",
        chainId: Networks.EthereumMainnet.chainId
    } as IERC20Token,
    [Networks.EthereumGoerli.chainId]: {
        address: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
        decimals: 18,
        symbol: 'WETH',
        name: 'Wrapped Ether',
        chainId: Networks.EthereumGoerli.chainId
    } as IERC20Token,
    [Networks.AvalancheMainnet.chainId]: {
        address: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
        decimals: 18,
        symbol: "WETH.e",
        name: "Wrapped ETH",
        chainId: Networks.AvalancheMainnet.chainId
    },
    [Networks.ArbitrumMainnet.chainId]: {
        address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped ETH",
        chainId: Networks.ArbitrumMainnet.chainId
    }
}

export const UNI = {
    [Networks.EthereumGoerli.chainId]: {
        "symbol": "UNI",
        "name": "Uniswap",
        "address": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        "decimals": 18,
        "chainId": Networks.EthereumGoerli.chainId
    } as IERC20Token
}