import {BigNumber, Contract, ethers} from 'ethers';
import {abi, chainConfig, Token, Multicall} from 'dexible-common';
import { ContractFactory } from 'dexible-pot-lib';

export interface TokenFindProps {
    address: string;
    provider: ethers.providers.Provider;
    owner?: string;
}


const bn = BigNumber.from;


export default async (props:TokenFindProps):Promise<Token> => {

    let netInfo = await props.provider.getNetwork();
    let r:InfoResponse = await getInfo({
        token: props.address,
        chainId: netInfo.chainId,
        provider: props.provider,
        owner: props.owner
    });
    if(r) {
        return {
            address: props.address.toLowerCase(),
            decimals: r.decimals,
            symbol: r.symbol, 
            balance: bn(r.balance||"0"),
            allowance: bn(r.allowance||"0")
        } as Token;
    }
    throw new Error(`Could not find token info for address ${props.address} on chain ${netInfo.chainId}`);
}

interface InfoProps {
    token: string;
    owner?:string;
    chainId:number;
    provider:ethers.providers.Provider;
}

interface InfoResponse {
    decimals: number,
    symbol: string,
    balance?:string,
    allowance?:string
}

export const getBalanceInfo = async (props: InfoProps): Promise<InfoResponse> => {
    let baseCall = {
        abi: abi.ERC20ABI, 
        address: props.token
    };
    let chainId = props.chainId || 1;

    //let dexibleAddress = chainConfig[chainId].Settlement;
    const dexible = await ContractFactory.getDexible(props.provider);
    if(!dexible || !dexible.address) {
        throw new Error(`Could not resolve Dexible address on network: ${chainId}`);
    }

    let ifc = new ethers.utils.Interface(abi.ERC20ABI);
    let balance = ifc.encodeFunctionData("balanceOf", [props.owner]);
    let allowance = ifc.encodeFunctionData("allowance", [props.owner, dexible.address]);
    
    let calls = [
       {
            ...baseCall,
            method: "balanceOf",
            callData: balance as string
        },{
            ...baseCall,
            method: "allowance",
            callData: allowance as string
        }
    ];

    let cfg = chainConfig[chainId];

    let r = await Multicall.aggregate({
        calls,
        provider: props.provider,
        mcAddress: cfg.Multicall
    });
    let bal = r[0][0];
    let allow = r[1][0];
   
    return {
        decimals: 0,
        symbol: "IGNORE",
        balance: bal?bal.toString():0,
        allowance: allow?allow.toString():0
    } as InfoResponse
}

const getInfo = async (props:InfoProps):Promise<InfoResponse> => {
    let baseCall = {
        abi: abi.ERC20ABI, 
        address: props.token
    };
    let chainId = props.chainId || 1;

    //let dexibleAddress = chainConfig[chainId].Settlement;
    const dexible = await ContractFactory.getDexible(props.provider);
    if(!dexible || !dexible.address) {
        throw new Error(`Could not resolve Dexible address on network: ${chainId}`);
    }

    let ifc = new ethers.utils.Interface(abi.ERC20ABI);
    let getDecimals = ifc.encodeFunctionData("decimals");
    let getSymbol = ifc.encodeFunctionData("symbol");
    let balance:undefined | string = undefined;
    let allowance:undefined | string = undefined;
    if(props.owner) {
        balance = ifc.encodeFunctionData("balanceOf", [props.owner]);
        allowance = ifc.encodeFunctionData("allowance", [props.owner, dexible.address]);
    }
    let calls = [
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
    if(props.owner) {
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

    let cfg = chainConfig[chainId];

    let r = await Multicall.aggregate({
        calls,
        provider: props.provider,
        mcAddress: cfg.Multicall
    });
    let decs = r[0][0];
    let symbol = r[1][0];
    let bal:any = null;
    let allow:any = null;
    if(r[2]) {
        bal = r[2][0];
        allow = r[3][0];
    }
    return {
        decimals: decs.toString()-0,
        symbol,
        balance: bal?bal.toString():0,
        allowance: allow?allow.toString():0
    } as InfoResponse
}