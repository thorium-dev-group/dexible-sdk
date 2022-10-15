
export default interface IPolicy  {
    name: string;

    serialize(): object;

    verify(): string | undefined;
}