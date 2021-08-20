
export default class SDKError extends Error {
    requestId: number;

    constructor(props:any) {
        super(props.message);
        this.requestId = props.requestId;
    }
}