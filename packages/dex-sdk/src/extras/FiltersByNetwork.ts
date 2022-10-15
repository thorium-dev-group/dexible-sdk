import { Networks } from "../common";

export enum EthereumMainnetDexFilter {
    Zrx = "0x",
    Balancer = "Balancer",
    Balancer_V2 = "Balancer_V2",
    Bancor = "Bancor",
    Bancor_V3 = "BancorV3",
    CryptoCom = "CryptoCom",
    Curve = "Curve",
    Curve_V2 = "Curve_V2",
    DODO = "DODO",
    DODO_V2 = "DODO_V2",
    Kyber = "KyberDMM",
    Lido = "Lido",
    MakerPsm = "MakerPsm",
    Saddle = "Saddle",
    Shell = "Shell",
    ShibaSwap = "ShibaSwap",
    SushiSwap = "SushiSwap",
    Synapse = "Synapse",
    Synthentix = "Synthetix",
    Uniswap = "Uniswap",
    Uniswap_V2 = "Uniswap_V2",
    Uniswap_V3 = "Uniswap_V3"
}

export enum ArbitrumDexFilter  {
    Balancer_V2 = "Balancer_V2",
	Curve_V2 = "Curve_V2",
	GMX = "GMX",
	Saddle = "Saddle",
	SushiSwap = "SushiSwap",
	Synapse = "Synapse",
	Uniswap_V3 = "Uniswap_V3"
}

export enum AvalancheDexFilter {
    Aave_V2 = "Aave_V2",
	Curve = "Curve",
	Curve_V2 = "Curve_V2",
	GMX = "GMX",
	Kyber = "KyberDMM",
	Pangolin = "Pangolin",
	Platypus = "Platypus",
	SushiSwap = "SushiSwap",
	Synapse = "Synapse",
	TraderJoe = "TraderJoe",
	W00Fi = "WOOFi"
}

export enum BinanceDexFilter {
    ACryptoS = "ACryptoS",
	ApeSwap = "ApeSwap",
	BakerySwap = "BakerySwap",
	Belt = "Belt",
	BiSwap = "BiSwap",
	DODO = "DODO",
    DODO_V2 = "DODO_V2",
    Ellipsis = "Ellipsis",
	FirebirdOneSwap = "FirebirdOneSwap",
	KnightSwap = "KnightSwap",
	Kyber = "KyberDMM",
	MDex = "MDex",
	Mooniswap = "Mooniswap",
	Nerve = "Nerve",
	PancakeSwap = "PancakeSwap",
	PancakeSwap_V2 = "PancakeSwap_V2",
	SushiSwap = "SushiSwap",
	Synapse = "Synapse",
	WaultSwap = "WaultSwap",
	WOOFi = "WOOFi"
}

export enum GoerliDexFilter {
    Zrx = "0x",
	SushiSwap = "SushiSwap",
	Uniswap = "Uniswap",
	Uniswap_V2 = "Uniswap_V2",
	Uniswap_V3 = "Uniswap_V3"
}

export enum FantomDexFilter {
    Beethovenx = "Beethovenx",
    Curve = "Curve",
    Curve_V2 = "Curve_V2",
    MorpheusSwap = "MorpheusSwap",
    SpiritSwap = "SpiritSwap",
    SpookySwap = "SpookySwap",
    SushiSwap = "SushiSwap",
    Synapse = "Synapse",
    WOOFi = "WOOFi",
    Yoshi = "Yoshi"
}

export enum OptimismDexFilter {
    Curve = "Curve",
	Curve_V2 = "Curve_V2",
	Saddle = "Saddle",
	Synapse = "Synapse",
	Synthetix = "Synthetix",
	Uniswap_V3 = "Uniswap_V3",
	Velodrome = "Velodrome"
}

export enum PolygonDexFilter {
    Aave_V2 = "Aave_V2",
	ApeSwap = "ApeSwap",
	Balancer_V2 = "Balancer_V2",
	Curve = "Curve",
	Curve_V2 = "Curve_V2",
	Dfyn = "Dfyn",
	DODO = "DODO",
	DODO_V2 = "DODO_V2",
	FirebirdOneSwap = "FirebirdOneSwap",
	IronSwap = "IronSwap",
	Kyber = "KyberDMM",
	MeshSwap = "MeshSwap",
	QuickSwap = "QuickSwap",
	SushiSwap = "SushiSwap",
	Synapse = "Synapse",
	Uniswap_V3 = "Uniswap_V3",
	WaultSwap = "WaultSwap",
	WOOFi = "WOOFi"
}

export const AllowedFiltersByNetwork = {
    [Networks.ArbitrumMainnet.chainId]: [
        "Balancer_V2",
		"Curve_V2",
		"GMX",
		"Saddle",
		"SushiSwap",
		"Synapse",
		"Uniswap_V3"
    ],
    [Networks.AvalancheMainnet.chainId]: [
        "Aave_V2",
		"Curve",
		"Curve_V2",
		"GMX",
		"KyberDMM",
		"MultiHop",
		"Pangolin",
		"Platypus",
		"SushiSwap",
		"Synapse",
		"TraderJoe",
		"WOOFi"
    ],
    [Networks.BinanceMainnet.chainId]: [
        "ACryptoS",
		"ApeSwap",
		"BakerySwap",
		"Belt",
		"BiSwap",
		"DODO",
		"DODO_V2",
		"Ellipsis",
		"FirebirdOneSwap",
		"KnightSwap",
		"KyberDMM",
		"LiquidityProvider",
		"MDex",
		"Mooniswap",
		"Nerve",
		"PancakeSwap",
		"PancakeSwap_V2",
		"SushiSwap",
		"Synapse",
		"WaultSwap",
		"WOOFi"
    ],
    [Networks.EthereumGoerli.chainId]: [
        "0x",
		"SushiSwap",
		"Uniswap",
		"Uniswap_V2",
		"Uniswap_V3"
    ],
    [Networks.EthereumMainnet.chainId]: [
        "0x",
        "Balancer",
		"Balancer_V2",
		"Bancor",
		"BancorV3",
		"CryptoCom",
		"Curve",
		"Curve_V2",
		"DODO",
		"DODO_V2",
		"KyberDMM",
		"Lido",
		"MakerPsm",
		"Saddle",
		"Shell",
		"ShibaSwap",
		"SushiSwap",
		"Synapse",
		"Synthetix",
		"Uniswap",
		"Uniswap_V2",
		"Uniswap_V3"
    ],
    [Networks.FantomMainnet.chainId]: [
        "Beethovenx",
		"Curve",
		"Curve_V2",
		"MorpheusSwap",
		"SpiritSwap",
		"SpookySwap",
		"SushiSwap",
		"Synapse",
		"WOOFi",
		"Yoshi"
    ],
    [Networks.OptimismMainnet.chainId]: [
        "Curve",
		"Curve_V2",
		"Saddle",
		"Synapse",
		"Synthetix",
		"Uniswap_V3",
		"Velodrome"
    ],
    [Networks.PolygonMainnet.chainId]: [
        "Aave_V2",
		"ApeSwap",
		"Balancer_V2",
		"Curve",
		"Curve_V2",
		"Dfyn",
		"DODO",
		"DODO_V2",
		"FirebirdOneSwap",
		"IronSwap",
		"KyberDMM",
		"MeshSwap",
		"QuickSwap",
		"SushiSwap",
		"Synapse",
		"Uniswap_V3",
		"WaultSwap",
		"WOOFi"
    ],
    
}