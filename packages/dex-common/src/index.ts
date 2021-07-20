import {default as chainConfig} from './chainConfig';
import * as abi from './abi';
import * as Multicall from './multicall';
import { Serializable } from './ISerializable';
import {Verifiable} from './IVerifiable';
import chainToName from './chainToName';
import * as Services from './services';
import IJWTHandler from './services/IJWTHandler';
import {default as Price} from './Price';
import {default as Token} from './Token';

interface Tag {
    name: string;
    value: string;
}

export {
    abi,
    chainConfig,
    IJWTHandler,
    Multicall,
    Serializable,
    Verifiable,
    chainToName,
    Services,
    Price,
    Token,
    Tag
}