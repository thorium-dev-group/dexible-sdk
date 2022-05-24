/* eslint-disable */
import Long from 'long';
import * as _m0 from 'protobufjs/minimal';
import { Timestamp } from '../google/protobuf/timestamp';

export const protobufPackage = '';

export interface GasPrices {
    chainId: number;
    networkId: number;
    blockNumber: number;
    gasTimestamp: Date | undefined;
    safe: number;
    recommended: number;
    fast: number;
    data: { [key: string]: number };
}

export interface GasPrices_DataEntry {
    key: string;
    value: number;
}

function createBaseGasPrices(): GasPrices {
    return {
        chainId: 0,
        networkId: 0,
        blockNumber: 0,
        gasTimestamp: undefined,
        safe: 0,
        recommended: 0,
        fast: 0,
        data: {},
    };
}

export const GasPrices = {
    encode(
        message: GasPrices,
        writer: _m0.Writer = _m0.Writer.create()
    ): _m0.Writer {
        if (message.chainId !== 0) {
            writer.uint32(8).uint32(message.chainId);
        }
        if (message.networkId !== 0) {
            writer.uint32(16).uint32(message.networkId);
        }
        if (message.blockNumber !== 0) {
            writer.uint32(24).uint64(message.blockNumber);
        }
        if (message.gasTimestamp !== undefined) {
            Timestamp.encode(
                toTimestamp(message.gasTimestamp),
                writer.uint32(34).fork()
            ).ldelim();
        }
        if (message.safe !== 0) {
            writer.uint32(40).uint64(message.safe);
        }
        if (message.recommended !== 0) {
            writer.uint32(48).uint64(message.recommended);
        }
        if (message.fast !== 0) {
            writer.uint32(56).uint64(message.fast);
        }
        Object.entries(message.data).forEach(([key, value]) => {
            GasPrices_DataEntry.encode(
                { key: key as any, value },
                writer.uint32(66).fork()
            ).ldelim();
        });
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): GasPrices {
        const reader =
            input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGasPrices();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chainId = reader.uint32();
                    break;
                case 2:
                    message.networkId = reader.uint32();
                    break;
                case 3:
                    message.blockNumber = longToNumber(reader.uint64() as Long);
                    break;
                case 4:
                    message.gasTimestamp = fromTimestamp(
                        Timestamp.decode(reader, reader.uint32())
                    );
                    break;
                case 5:
                    message.safe = longToNumber(reader.uint64() as Long);
                    break;
                case 6:
                    message.recommended = longToNumber(reader.uint64() as Long);
                    break;
                case 7:
                    message.fast = longToNumber(reader.uint64() as Long);
                    break;
                case 8:
                    const entry8 = GasPrices_DataEntry.decode(
                        reader,
                        reader.uint32()
                    );
                    if (entry8.value !== undefined) {
                        message.data[entry8.key] = entry8.value;
                    }
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): GasPrices {
        return {
            chainId: isSet(object.chainId) ? Number(object.chainId) : 0,
            networkId: isSet(object.networkId) ? Number(object.networkId) : 0,
            blockNumber: isSet(object.blockNumber)
                ? Number(object.blockNumber)
                : 0,
            gasTimestamp: isSet(object.gasTimestamp)
                ? fromJsonTimestamp(object.gasTimestamp)
                : undefined,
            safe: isSet(object.safe) ? Number(object.safe) : 0,
            recommended: isSet(object.recommended)
                ? Number(object.recommended)
                : 0,
            fast: isSet(object.fast) ? Number(object.fast) : 0,
            data: isObject(object.data)
                ? Object.entries(object.data).reduce<{ [key: string]: number }>(
                      (acc, [key, value]) => {
                          acc[key] = Number(value);
                          return acc;
                      },
                      {}
                  )
                : {},
        };
    },

    toJSON(message: GasPrices): unknown {
        const obj: any = {};
        message.chainId !== undefined &&
            (obj.chainId = Math.round(message.chainId));
        message.networkId !== undefined &&
            (obj.networkId = Math.round(message.networkId));
        message.blockNumber !== undefined &&
            (obj.blockNumber = Math.round(message.blockNumber));
        message.gasTimestamp !== undefined &&
            (obj.gasTimestamp = message.gasTimestamp.toISOString());
        message.safe !== undefined && (obj.safe = Math.round(message.safe));
        message.recommended !== undefined &&
            (obj.recommended = Math.round(message.recommended));
        message.fast !== undefined && (obj.fast = Math.round(message.fast));
        obj.data = {};
        if (message.data) {
            Object.entries(message.data).forEach(([k, v]) => {
                obj.data[k] = Math.round(v);
            });
        }
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<GasPrices>, I>>(
        object: I
    ): GasPrices {
        const message = createBaseGasPrices();
        message.chainId = object.chainId ?? 0;
        message.networkId = object.networkId ?? 0;
        message.blockNumber = object.blockNumber ?? 0;
        message.gasTimestamp = object.gasTimestamp ?? undefined;
        message.safe = object.safe ?? 0;
        message.recommended = object.recommended ?? 0;
        message.fast = object.fast ?? 0;
        message.data = Object.entries(object.data ?? {}).reduce<{
            [key: string]: number;
        }>((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = Number(value);
            }
            return acc;
        }, {});
        return message;
    },
};

function createBaseGasPrices_DataEntry(): GasPrices_DataEntry {
    return { key: '', value: 0 };
}

export const GasPrices_DataEntry = {
    encode(
        message: GasPrices_DataEntry,
        writer: _m0.Writer = _m0.Writer.create()
    ): _m0.Writer {
        if (message.key !== '') {
            writer.uint32(10).string(message.key);
        }
        if (message.value !== 0) {
            writer.uint32(16).uint64(message.value);
        }
        return writer;
    },

    decode(
        input: _m0.Reader | Uint8Array,
        length?: number
    ): GasPrices_DataEntry {
        const reader =
            input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGasPrices_DataEntry();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.value = longToNumber(reader.uint64() as Long);
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): GasPrices_DataEntry {
        return {
            key: isSet(object.key) ? String(object.key) : '',
            value: isSet(object.value) ? Number(object.value) : 0,
        };
    },

    toJSON(message: GasPrices_DataEntry): unknown {
        const obj: any = {};
        message.key !== undefined && (obj.key = message.key);
        message.value !== undefined && (obj.value = Math.round(message.value));
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<GasPrices_DataEntry>, I>>(
        object: I
    ): GasPrices_DataEntry {
        const message = createBaseGasPrices_DataEntry();
        message.key = object.key ?? '';
        message.value = object.value ?? 0;
        return message;
    },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof self !== 'undefined') return self;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    throw 'Unable to locate global object';
})();

type Builtin =
    | Date
    | Function
    | Uint8Array
    | string
    | number
    | boolean
    | undefined;

export type DeepPartial<T> = T extends Builtin
    ? T
    : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends {}
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
    ? P
    : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
              Exclude<keyof I, KeysOfUnion<P>>,
              never
          >;

function toTimestamp(date: Date): Timestamp {
    const seconds = date.getTime() / 1_000;
    const nanos = (date.getTime() % 1_000) * 1_000_000;
    return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
    let millis = t.seconds * 1_000;
    millis += t.nanos / 1_000_000;
    return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
    if (o instanceof Date) {
        return o;
    } else if (typeof o === 'string') {
        return new Date(o);
    } else {
        return fromTimestamp(Timestamp.fromJSON(o));
    }
}

function longToNumber(long: Long): number {
    if (long.gt(Number.MAX_SAFE_INTEGER)) {
        throw new globalThis.Error(
            'Value is larger than Number.MAX_SAFE_INTEGER'
        );
    }
    return long.toNumber();
}

if (_m0.util.Long !== Long) {
    _m0.util.Long = Long as any;
    _m0.configure();
}

function isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
}

function isSet(value: any): boolean {
    return value !== null && value !== undefined;
}
