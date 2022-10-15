
import {getNetwork, IERC20Token, SDKError} from '../common';
import * as abi from '../abi';
import {BigNumber, ethers} from 'ethers';
import * as Multicall from '../multicall';
import {Web3Factory} from '../web3';

export interface TokenInfo {
    address: string;
    decimals: number;
    symbol: string;
    balance?: BigNumber;
    allowance?: BigNumber;
}

const TTL = 60 * 1000;

type CacheEntry = {
    info: TokenInfo;
    timeout: number;
}

export class TokenLookup {
    
    static balancesCache: {
        [k: string]: CacheEntry
    } = {};
    
    static detailsCache: {
        [k: string]: CacheEntry
    } = {};

    static async getInfo(token: IERC20Token, trader?: string): Promise<TokenInfo> {
        
        const dkey = `${token.address}:${token.chainId}`;
        const bkey = `${trader}:${token.address}:${token.chainId}`;
        let dentry = TokenLookup.detailsCache[dkey];
        let bentry = trader ? TokenLookup.balancesCache[bkey] : undefined;
        if(!trader && dentry ) {
            return dentry.info;
        }
        if(bentry && bentry.timeout > Date.now()) {
            return bentry.info;
        }
    
        const baseCall = {
            abi: abi.ERC20ABI, 
            address: token.address
        };
        const chainId = token.chainId;
        const net = getNetwork(chainId);

        const dexibleAddress = net.contracts?.Settlement;
        const ifc = new ethers.utils.Interface(abi.ERC20ABI);
        const getDecimals = ifc.encodeFunctionData("decimals");
        const getSymbol = ifc.encodeFunctionData("symbol");
        let balance:undefined | string = undefined;
        let allowance:undefined | string = undefined;
        if(trader) {
            balance = ifc.encodeFunctionData("balanceOf", [trader]);
            allowance = ifc.encodeFunctionData("allowance", [trader, dexibleAddress]);
        }
        const calls = [
            {
                ...baseCall,
                method: "decimals",
                callData: getDecimals
            },
            {
                ...baseCall,
                method: "symbol", 
                callData: getSymbol
            }
        ];
        if(trader) {
            calls.push({
                ...baseCall,
                method: "balanceOf",
                callData: balance as string
            });
            calls.push({
                ...baseCall,
                method: "allowance",
                callData: allowance as string
            })
        };

        const mcAddr = net.contracts?.Multicall;
        if(!mcAddr) {
            throw new SDKError({
                message: "Selected chain has no configured Multicall contract"
            });
        }

        const provider = await Web3Factory.instance.getProvider(chainId);

        let r = await Multicall.aggregate({
            calls,
            provider: provider,
            mcAddress: mcAddr
        });
        let decs = r[0][0];
        let symbol = r[1][0];
        let bal:any = null;
        let allow:any = null;
        if(r[2]) {
            bal = r[2][0];
            allow = r[3][0];
        }
        const info = {
            decimals: +decs.toString(),
            symbol,
            balance: BigNumber.from(bal?bal.toString():0),
            allowance: BigNumber.from(allow?allow.toString():0)
        } as TokenInfo;
        TokenLookup.detailsCache[dkey] = {
            info,
            timeout: Date.now() + TTL
        };
        if(trader) {
            TokenLookup.balancesCache[bkey] = {
                info,
                timeout: Date.now() + TTL
            }
        }
        return info;
    }
}