import Quote, { QuoteRequest } from './QuoteGrabber';
import { ethers } from 'ethers';
import { TokenFinder } from 'dexible-token';
import { Web3Factory } from 'dexible-web3';
import {
    Services,
    resolveApiEndpointByChainId,
} from 'dexible-common';

const dotenv = require('dotenv');
dotenv.config();

const MATIC = "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0";
const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";
const IFUND = "0x04b5e13000c6e9a3255dc057091f3e3eeee7b0f0";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const MAINNET = 1;
const MAINNET_NAME = "mainnet";

export const WETH_ROPSTEN = "0xc778417e063141139fce010982780140aa0cd5ab";
export const DAI_ROPSTEN = "0xad6d458402f60fd3bd25163575031acdce07538d";
const ROPSTEN = 3;

const TOKEN_IN = DAI;
const TOKEN_OUT = WETH;
const NETWORK = MAINNET;
const NNAME = "ethereum";
const AMOUNT = ethers.utils.parseUnits("120000", 18).toString();

describe("QuoteGrabber", () => {

    test("Should get a quote for mainnet", async () => {
        // let walletKey = process.env.TRADER_WALLET;
        // if(!walletKey) {
        //     throw new Error("Test requires TRADER_WALLET env var that has wallet key");
        // }
        let provider = await Web3Factory({
            chainId: NETWORK,
            network: NNAME,
            infuraKey: process.env.INFURA_KEY
        });

        // let wallet = new ethers.Wallet(walletKey);
        const baseUrl = resolveApiEndpointByChainId(NETWORK);

        let api = new Services.APIClient({
            baseUrl,
            authenticationHandler: {} as any,
        });

        let tokenIn = await TokenFinder({
            address: TOKEN_IN,
            provider
        });

        let tokenOut = await TokenFinder({
            address: TOKEN_OUT,
            provider
        });

        let req: QuoteRequest = {
            chainId: NETWORK,
            apiClient: api,
            amountIn: AMOUNT,
            slippagePercent: .5,
            tokenIn,
            tokenOut
        };

        let r = await Quote(req);
        if (!r) {
            throw new Error("Expected a result");
        }

        console.log("QUOTE", r);
    }, 30_000);
});
