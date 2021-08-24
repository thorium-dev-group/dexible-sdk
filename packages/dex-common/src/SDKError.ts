
export default class SDKError extends Error {
    requestId: number;
    data?: any;

    constructor(props:any) {
        super(props.message);
        this.data = props.data;
        this.requestId = props.requestId;
    }
}