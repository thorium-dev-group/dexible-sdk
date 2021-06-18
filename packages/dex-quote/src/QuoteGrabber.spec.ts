import Quote, {QuoteRequest} from './QuoteGrabber';
import {EthHttpSignatureAxiosAdapter} from 'dex-eth-http-signatures';
import {ethers} from 'ethers';
import {TokenFinder} from 'dex-token';
import {Web3Factory} from 'dex-web3';

const dotenv = require('dotenv');
dotenv.config();

const MATIC = "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0";
const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";
const IFUND = "0x04b5e13000c6e9a3255dc057091f3e3eeee7b0f0";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const MAINNET=1;
const MAINNET_NAME = "mainnet";

const TOKEN_IN = MATIC;
const TOKEN_OUT = USDC;
const NETWORK = MAINNET;
const CHAIN_NAME = MAINNET_NAME;
const NNAME = "ethereum";
const AMOUNT = ethers.utils.parseUnits("120000", 18).toString();

describe("QuoteGrabber", function() {
    this.timeout(30000);

    it("Should get a quote for mainnet", async function() {
        let walletKey = process.env.TRADER_WALLET;
        if(!walletKey) {
            throw new Error("Test requires TRADER_WALLET env var that has wallet key");
        }
        let provider = await Web3Factory({
            chainId: NETWORK,
            network: NNAME,
            infuraKey: process.env.INFURA_KEY
        });

        let wallet = new ethers.Wallet(walletKey);
        let adapter = EthHttpSignatureAxiosAdapter.build(wallet);
        let tokenIn = await TokenFinder({
            address: TOKEN_IN,
            provider
        });
        let tokenOut = await TokenFinder({
            address: TOKEN_OUT,
            provider
        });
        let req:QuoteRequest = {
            adapter,
            amountIn: AMOUNT,
            chainId: NETWORK,
            chainName: CHAIN_NAME,
            network:  NNAME,
            slippagePercent: .5,
            tokenIn,
            tokenOut
        } as QuoteRequest;
        let r = await Quote(req);
        if(!r) {
            throw new Error("Expected a result");
        }
        console.log("QUOTE", r);
    });
});
