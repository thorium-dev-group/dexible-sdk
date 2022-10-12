import {Serializable, Verifiable} from 'dexible-common';

export default interface IPolicy  {
    name: string;

    serialize: Serializable;

    verify: Verifiable;
}