
/**
 * Abstraction of fields needed for ERC20 tokens that are managed under
 * Dexible swaps, etc.
 */
export interface IERC20Token {
    //address of the token contract on its native chain
    address: string;

    //the chain where the token contract is deployed
    chainId: number;

    //decimals for the token
    decimals: number;
    symbol?: string;
    name?: string;
}