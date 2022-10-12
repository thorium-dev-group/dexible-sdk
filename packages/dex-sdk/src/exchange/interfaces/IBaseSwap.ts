import {BigNumber, ethers} from 'ethers';
import { IERC20Token } from '../../common';
import { Slippage } from '../../common/Slippage';

//min allowed slippage is 50bps
export const MIN_SLIPPAGE = new Slippage(.05, false);

export interface IBaseSwap {
    tokenIn: IERC20Token;
    tokenOut: IERC20Token;
    amountIn: BigNumber;
    //either provide slippage or an exact minimum output amount
    slippage?: Slippage;
    amountOutMin?: BigNumber;
}