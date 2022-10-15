

type SlippageGetter = () => number;
type MaxRounds = () => number;

export default interface IAlgo {
    name: string;
    maxRounds: MaxRounds;
    getSlippage: SlippageGetter;
    serialize(): object;
    verify(): string | undefined;
}