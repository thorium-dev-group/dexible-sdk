export type ChartSpotData = {
    timestamp: number;
    price: number;
    baseTokenPriceUSD: number;
    quoteTokenPriceUSD: number;    
};

export type ChartFillData = {
    timestamp: number;
    priceBeforeFees: number;
    priceAfterFees: number;
    status: "COMPLETED" | "FAILED" | "PENDING";
    amountIn: string;
    amountOut: string | undefined | null;
    expectedAmountOut: string;
};

export type ChartData = {

    orderId: number | string;
    chainId: number;
    inputToken: string;
    outputToken: string;
    baseToken: {
        address: string;
        decimals: number;
        symbol: string;
    }
    quoteToken: {
        address: string;
        decimals: number;
        symbol: string;
    }
    timeRange: {
        start: string;
        end: string;
    }
    spots: ChartSpotData[];
    fills: ChartFillData[];
};
