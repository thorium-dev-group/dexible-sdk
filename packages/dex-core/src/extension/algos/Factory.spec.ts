import Factory, { LimitProps, StopLossProps } from './Factory';
import * as Algos from 'dexible-algos';
import {
    Price,
    Token,
} from 'dexible-common';
import { BigNumber } from 'ethers';

const tokenIn: Token = {
    address: '0x' + '0'.repeat(40),
    decimals: 18,
    symbol: 'TEST',
    allowance: BigNumber.from(0),
    balance: BigNumber.from(0),
    name: 'TEST',
};

const tokenOut = tokenIn;

const price = Price.unitsToPrice({
    inToken: tokenIn,
    outToken: tokenOut,
    inUnits: 1, //dai in
    outUnits: .00133 //WETH out
});


describe("AlgoFactory", () => {

    it("Should generate market algo", async () => {
        let factory = new Factory();
        let algo = factory.createMarket({
            maxRounds: 5,
            type: Algos.Market.tag,
            gasPolicy: {
                type: "relative",
                deviation: 0
            },
            slippagePercent: .5
        });
        if (!algo) {
            throw new Error("Expected a market algo");
        }
        let err = algo.verify();
        if (err) {
            throw new Error(err);
        }
        console.log("Market", algo);
    });

    it("Should generate limit algo", async () => {

        let factory = new Factory();
        let algo = factory.createLimit({
            type: Algos.Limit.tag,
            maxRounds: 5,
            gasPolicy: {
                type: "relative"
            },
            slippagePercent: .5,
            // limitAction: "buy",
            price
        });
        if (!algo) {
            throw new Error("Expected algo");
        }
        let err = algo.verify();
        if (err) {
            throw new Error(err);
        }
        console.log("Limit", algo);
    });

    it("Should fail to create limit with action and price", async () => {
        let factory = new Factory();
        let props = {
            type: Algos.Limit.tag,
            maxRounds: 5,
            gasPolicy: {
                type: "relative"
            },
            slippagePercent: .5,

        } as LimitProps;

        let algo = factory.createLimit(props);
        if (!algo) {
            throw new Error("Expected algo");
        }
        let err = algo.verify();
        if (!err) {
            throw new Error("Expected verification to fail");
        }
        props = {
            ...props,
            limitAction: "buy"
        } as LimitProps;
        algo = factory.createLimit(props);
        err = algo.verify();
        if (!err) {
            throw new Error("Expected verification to fail");
        }
        props = {
            ...props,
            price,
        } as LimitProps;
        algo = factory.createLimit(props);
        err = algo.verify();
        if (err) {
            throw new Error(err);
        }

    });

    it("Should create a stop loss algo", async () => {
        let factory = new Factory();
        let algo = factory.createStopLoss({
            type: Algos.StopLoss.tag,
            maxRounds: 5,
            gasPolicy: {
                type: "relative"
            },
            slippagePercent: .5,
            isAbove: true,
            triggerPrice: price,
        });
        if (!algo) {
            throw new Error("Expected algo");
        }
        let err = algo.verify();
        if (err) {
            throw new Error(err);
        }
        console.log("StopLoss", algo);
    })

    it("Should fail if missing stop loss props", async () => {
        let factory = new Factory();
        let props = {
            type: Algos.StopLoss.tag,
            maxRounds: 5,
            gasPolicy: {
                type: "relative"
            },
            slippagePercent: .5
        } as StopLossProps;

        let algo = factory.createStopLoss(props);
        if (!algo) {
            throw new Error("Expected algo");
        }
        let err = algo.verify();
        if (!err) {
            throw new Error("Expected to fail");
        }
        props = {
            ...props,
            triggerPrice: price,
        }
        algo = factory.createStopLoss(props);
        if (!algo) {
            throw new Error("Expected algo");
        }
        err = algo.verify();
        if (err) {
            throw new Error(err);
        }
    });

    it("Should create a TWAP algo", async () => {
        let factory = new Factory();
        let algo = factory.createTWAP({
            type: Algos.StopLoss.tag,
            maxRounds: 5,
            gasPolicy: {
                type: "relative"
            },
            slippagePercent: .5,
            timeWindow: {
                hours: 24,
            },
            priceRange: {
                basePrice: price,
                upperBoundPercent: 5,
                lowerBoundPercent: 10
            }
        });
        if (!algo) {
            throw new Error("Expected algo");
        }
        let err = algo.verify();
        if (err) {
            throw new Error(err);
        }
        console.log("TWAP", algo);
    })
})
