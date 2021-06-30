import Factory, {LimitProps, StopLossProps} from './Factory';
import * as Algos from 'dex-algos';

describe("AlgoFactory", function() {

    it("Should generate market algo", async function() {
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
        if(!algo) {
            throw new Error("Expected a market algo");
        }
        let err = algo.verify();
        if(err) {
            throw new Error(err);
        }
        console.log("Market", algo);
    });

    it("Should generate limit algo", async function() {
        let factory = new Factory();
        let algo = factory.createLimit({
            type: Algos.Limit.tag,
            maxRounds: 5,
            gasPolicy: {
                type: "relative"
            },
            slippagePercent: .5,
            limitAction: "buy",
            price: .0006
        });
        if(!algo) {
            throw new Error("Expected algo");
        }
        let err = algo.verify();
        if(err) {
            throw new Error(err);
        }
        console.log("Limit", algo);
    });

    it("Should fail to create limit with action and price", async function() {
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
        if(!algo) {
            throw new Error("Expected algo");
        }
        let err = algo.verify();
        if(!err) {
            throw new Error("Expected verification to fail");
        }
        props = {
            ...props,
            limitAction: "buy"
        } as LimitProps;
        algo = factory.createLimit(props);
        err = algo.verify();
        if(!err) {
            throw new Error("Expected verification to fail");
        }
        props = {
            ...props,
            price: .0006
        } as LimitProps;
        algo = factory.createLimit(props);
        err = algo.verify();
        if(err) {
            throw new Error(err);
        }
        
    });

    it("Should create a stop loss algo", async function() {
        let factory = new Factory();
        let algo = factory.createStopLoss({
            type: Algos.StopLoss.tag,
            maxRounds: 5,
            gasPolicy: {
                type: "relative"
            },
            slippagePercent: .5,
            isAbove: true,
            triggerPrice: .006
        });
        if(!algo) {
            throw new Error("Expected algo");
        }
        let err = algo.verify();
        if(err) {
            throw new Error(err);
        }
        console.log("StopLoss", algo);
    })

    it("Should fail if missing stop loss props", async function() {
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
        if(!algo) {
            throw new Error("Expected algo");
        }
        let err = algo.verify();
        if(!err) {
            throw new Error("Expected to fail");
        }
        props = {
            ...props,
            triggerPrice: .006
        }
        algo = factory.createStopLoss(props);
        if(!algo) {
            throw new Error("Expected algo");
        }
        err = algo.verify();
        if(err) {
            throw new Error(err);
        }
    });

    it("Should create a TWAP algo", async function() {
        let factory = new Factory();
        let algo = factory.createTWAP({
            type: Algos.StopLoss.tag,
            maxRounds: 5,
            gasPolicy: {
                type: "relative"
            },
            slippagePercent: .5,
            timeWindow: "24h",
            priceRange: {
                basePrice: .0006,
                upperBoundPercent: 5,
                lowerBoundPercent: 10
            }
        });
        if(!algo) {
            throw new Error("Expected algo");
        }
        let err = algo.verify();
        if(err) {
            throw new Error(err);
        }
        console.log("TWAP", algo);
    })
})