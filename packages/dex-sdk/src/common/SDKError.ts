
export class SDKError extends Error {
    requestId: number;
    data?: any;
    code: any;

    constructor(props:any) {
        super(props.message);
        this.code = props.code;
        this.data = props.data;
        this.requestId = props.requestId;
    }
}