
export interface IERC20Token {
    address: string;
    chainId: number;
    decimals: number;
    symbol?: string;
    name?: string;
}