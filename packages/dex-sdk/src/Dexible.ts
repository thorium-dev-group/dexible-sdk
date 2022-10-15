import { ISwapResult, ITokenExchange, TokenExchange } from "./exchange";
import { BigNumber, ethers, Transaction } from "ethers";
import { getNetwork, IERC20Token, SDKError } from "./common";
import { OrderServiceFactory, TokenLookup } from "./services";
import {APIClient, IJWTHandler} from './client';
import * as abi from './abi';
import {APIClientFactory} from './services/APIClientFactory';
import {IWeb3Factory} from './common/IWeb3Factory';
import { Web3Factory } from "./web3";
import { MarketingProps } from "./extras";

export interface DexibleConfig {
    signer?: ethers.Signer;
    domainOverride?: string;
    markingProps?: MarketingProps;
    jwtHandler?: IJWTHandler;
    web3Factory: IWeb3Factory;
    usingWalletConnect?: boolean;
}

//entry point for integrations
export class Dexible {

    readonly signer?: ethers.Signer;
    readonly baseDomain?: string;
    readonly jwtHandler?: IJWTHandler;
    readonly marketingProps?: MarketingProps;
    exchange: ITokenExchange;

    constructor(cfg: DexibleConfig) {
        
        this.signer = cfg.signer;
        this.baseDomain = cfg.domainOverride;
        this.jwtHandler = cfg.jwtHandler;
        this.marketingProps = cfg.markingProps;
        Web3Factory.instance.factoryImpl= cfg.web3Factory;
        APIClientFactory.instance.configure({
            jwtHandler: this.jwtHandler,
            overrideDomain: this.baseDomain,
            signer: this.signer,
            usingWalletConnect: cfg.usingWalletConnect
        });
        this.exchange = new TokenExchange(this.signer, this.marketingProps);
    }


    async approveSpend(token: IERC20Token, amount: BigNumber): Promise<Transaction|false> {
       
        if(!this.signer) {
            throw new SDKError({
                message: "Spend approval requires a signer"
            });
        }
        if(!this.signer.provider) {
            throw new SDKError({
                message: "Signer requires a provider"
            });
        }
        if(amount.lte(0)) {
            throw new SDKError({
                message: "Approval amount must be > 0"
            });
        }

        const info = await TokenLookup.getInfo(token, await this.signer.getAddress());
        if(!info.balance || info.balance.lt(amount)) {
            
            const net = await this.signer.provider.getNetwork();
            if(net.chainId !== token.chainId) {
                throw new SDKError({
                    message: "Token is mis-aligned with signer's provider chain"
                });
            }
            const chainInfo = getNetwork(token.chainId);
            const con = new ethers.Contract(token.address, abi.ERC20ABI, this.signer);
            return con.approve(chainInfo.contracts?.Settlement, amount);
        }
        return false;
    }

    async getSpendAllowance(token: IERC20Token, trader: string): Promise<BigNumber> {
        const info = await TokenLookup.getInfo(token, trader);
        return info.allowance || BigNumber.from(0);
    }


    


   
}