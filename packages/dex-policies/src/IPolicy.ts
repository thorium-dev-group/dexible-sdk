import {Serializable, Verifiable} from 'dex-common';

export default interface IPolicy  {
    name: string;

    serialize: Serializable;

    verify: Verifiable;
}