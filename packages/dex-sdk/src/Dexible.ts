import { ITokenExchange, TokenExchange } from "./exchange";
import { BigNumber, ethers, Transaction } from "ethers";
import { getNetwork, IERC20Token, SDKError } from "./common";
import { TokenLookup } from "./services";
import {IJWTHandler} from './client';
import * as abi from './abi';
import {APIClientFactory} from './services/APIClientFactory';
import {IWeb3Factory} from './common/IWeb3Factory';
import { Web3FactoryHolder } from "./web3";
import { MarketingProps } from "./extras";
import {ReportService} from './services';

/**
 * Primary configuration for Dexible SDK
 */
export interface DexibleConfig {
    //optional signerl when using Dexible for a specific trader
    signer?: ethers.Signer;

    //optionally override backend infra domain. Used for testing
    domainOverride?: string;

    //optionally provide marketing referrals or promo codes
    markingProps?: MarketingProps;

    //optionally use Dexible with JWT authentication
    jwtHandler?: IJWTHandler;

    //MUST provide a web3 factory to constructor providers for specified networks
    web3Factory: IWeb3Factory;

    //whether the SDK is being used with wallet connect directly.
    usingWalletConnect?: boolean;
}

/**
 * Dexible is the main entry point for using the SDK. An instance of Dexible
 * allows access to Dexible features, such as token spend allowance management
 * and token exchange functionality. Future versions will extend to other
 * Dexible features such as bridging, staking, farming, etc.
 */
export class Dexible {

    //optionally provide a signer to Dexible if you want swap status or when
    //submitting automation requests
    readonly signer?: ethers.Signer;

    //overriding the base domain of Dexible's backend infra. This is primarily
    //used in testing
    readonly baseDomain?: string;

    //When Dexible is used with JWT authorization, this abstraction handles 
    //retrieving and storing JWT data
    readonly jwtHandler?: IJWTHandler;

    //optionally, Dexible can be used with referrals and promo codes.
    readonly marketingProps?: MarketingProps;

    //the exchange allows for automated algo trading
    exchange: ITokenExchange;

    reports: ReportService;

    constructor(cfg: DexibleConfig) {
        
        this.signer = cfg.signer;
        this.baseDomain = cfg.domainOverride;
        this.jwtHandler = cfg.jwtHandler;
        this.marketingProps = cfg.markingProps;
        Web3FactoryHolder.instance.factoryImpl= cfg.web3Factory;
        APIClientFactory.instance.configure({
            jwtHandler: this.jwtHandler,
            overrideDomain: this.baseDomain,
            signer: this.signer,
            usingWalletConnect: cfg.usingWalletConnect
        });
        this.exchange = new TokenExchange(this.signer, this.marketingProps);
        this.reports = new ReportService();
    }


    /**
     * Grant or revoke (amount = 0) spend allowance for the Dexible settlement contract.
     * 
     * @param token 
     * @param amount 
     * @returns 
     */
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

    /**
     * Lookup a trader's spend allowance for Dexible settlement contract
     * 
     * @param token 
     * @param trader 
     * @returns 
     */
    async getSpendAllowance(token: IERC20Token, trader: string): Promise<BigNumber> {
        const info = await TokenLookup.getInfo(token, trader);
        return info.allowance || BigNumber.from(0);
    }

    async getBalanceAndSpendAllowance(token: IERC20Token, trader: string): Promise<BigNumber[]> {
        const info = await TokenLookup.getInfo(token, trader);
        return [info.balance || BigNumber.from(0) , info.allowance || BigNumber.from(0)];
    }

    


   
}