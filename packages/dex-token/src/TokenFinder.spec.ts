import Finder, {Token, TokenFindProps} from './TokenFinder';
import {Web3Factory} from 'dex-web3';

const dotenv = require('dotenv');
dotenv.config();


describe("TokenFinder", function() {

    this.timeout(30000);

    it("Should find token info", async function() {

        let provider = await Web3Factory({
            chainId: 1,
            network: "ethereum",
            infuraKey: process.env.INFURA_KEY
        });

        let token = await Finder({
            address: "0x04b5e13000c6e9a3255dc057091f3e3eeee7b0f0",
            provider
        });
        if(!token) {
            throw new Error("Should have found token");
        }
        console.log(token);
    });
});