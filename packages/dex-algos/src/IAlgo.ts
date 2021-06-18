import {Serializable, Verifiable} from 'dex-common';

export default interface IAlgo {
    name: string;
    serialize: Serializable;
    verify: Verifiable;
}