export class SDKError extends Error {
    code?: string;
    data?: any;
    requestId?: number;
    responseStatusCode?: number;
    timestamp?: number;
    traceId?: string;

    constructor(props:any) {
        super(props.message);
        this.code = props.code;
        this.data = props.data;
        this.requestId = props.requestId;
        this.responseStatusCode = props.responseStatusCode;
        this.timestamp = props.timestamp;
        this.traceId = props.traceId;
    }
}
