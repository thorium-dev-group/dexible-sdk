import { ITokenExchange, TokenExchange } from "./exchange";
import { ethers } from "ethers";

//entry point for integrations
export class Dexible {

    exchange: ITokenExchange;

    constructor(
        readonly signer?: ethers.Signer
    ) {
        this.exchange = new TokenExchange();
    }

}