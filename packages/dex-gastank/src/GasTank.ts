import {abi, chainConfig} from 'dex-common';
import {BigNumberish, ethers} from 'ethers';

export interface GetBalanceRequest {
    trader: string;
}

export interface DepositRequest  {
    gasPrice: BigNumberish,
    amount: BigNumberish
}

export interface ThawRequest {
    gasPrice: BigNumberish,
    amount: BigNumberish
}

export interface WithdrawRequest {
    gasPrice: BigNumberish,
    amount: BigNumberish
}

export default class GasTank {

    wallet: ethers.Wallet;

    constructor(wallet:ethers.Wallet) {
        this.wallet = wallet;
    }

    getBalance = async (req:GetBalanceRequest) => {
        let {trader} = req;
        let con = await buildContract(this.wallet.provider);
        return con.availableForUse(trader);
    }

    deposit = async (req:DepositRequest) => {
        let {gasPrice, amount} = req;
        let con = await buildContract(this.wallet.provider);
        con = con.connect(this.wallet);
        let est = await con.estimateGas.deposit({
            from: this.wallet.address,
            value: amount,
            gasPrice
        });

        return con.deposit({
            from: this.wallet.address,
            gasPrice,
            gasLimit: est.mul(120).div(100),
            value: amount
        });
    }

    requestThaw = async (req:ThawRequest) => {
        let {gasPrice, amount} = req;
        let con = await buildContract(this.wallet.provider);
        con = con.connect(this.wallet);
        let est = await con.estimateGas.requestWithdrawGas({
            from: this.wallet.address,
            gasPrice,
            value: amount
        });
        return con.requestWithdrawGas({
            from: this.wallet.address,
            value: amount,
            gasPrice,
            gasLimit: est
        });
    }

    withdraw = async (req:WithdrawRequest) => {
        let {gasPrice, amount} = req;
        let con = await buildContract(this.wallet.provider);
        con = con.connect(this.wallet);
        let est = await con.estimateGas.withdrawGas({
            from: this.wallet.address,
            gasPrice,
            value: amount
        });
        return con.withdrawGas({
            from: this.wallet.address,
            value: amount,
            gasPrice,
            gasLimit: est
        });
    }
}

const buildContract = async (provider:ethers.providers.Provider) => {
    let netInfo = await provider.getNetwork();
        
    let addr = chainConfig[netInfo.chainId].Settlement;
    if(!addr) {
        throw new Error("Dexible not deployed on network with chainId: " + netInfo.chainId);
    }
    return new ethers.Contract(addr, abi.Dexible, provider);
}