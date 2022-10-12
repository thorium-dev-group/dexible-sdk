import { ethers } from 'ethers';
import Logger from '../logger';
const log = new Logger({ component: "HttpSignature" });

const PARAMETER_SEPARATOR_PATTERN = /\s*,\s*/;

const REQUEST_TARGET_FIELD = '(request-target)';

const SIGNATURE_PREFIX = 'Signature ';

const VALID_PARAMETERS = new Set([
    'keyId',
    'algorithm',
    'headers',
    'signature',
]);

const REQUIRED_PARAMETERS = new Set([
    'keyId',
    'algorithm',
    'headers',
    'signature',
]);

type QueryParams = {
    [key: string]: string | undefined | null;
};

export interface HttpSignatureParams {
    keyId: string;
    algorithm: string;
    headers: string;
    signature: string;
}


export interface HttpSignatureRequestProps {
    requestPath: string;
    requestMethod: string;
    requestQueryParams?: QueryParams;
    requiredHeaderFields: Array<string>;
    headers: object;
};


export default abstract class HttpSignature {

    abstract generateSignatureString(wallet: ethers.Signer, requestProps): Promise<string>

    abstract validate(parsedSignatureFields: HttpSignatureParams, requestProps): Promise<void>

    static validateCommonFields(parsedSignatureFields: HttpSignatureParams, requestProps): void {

        HttpSignature.validateHttpSignatureParams(parsedSignatureFields)
    }

    /**
     * Return a header value, lookup by original case first, falling back to lower case.
     * 
     * @param headerField 
     * @param headers 
     * @returns 
     */
    static getHeaderValue(headerField: string, headers: object): string {
        let value;

        if (headerField in headers) {
            value = headers[headerField];
        } else {
            const headerFieldLower = headerField.toLowerCase();
            if (headerFieldLower in headers) {
                value = headers[headerFieldLower];
            }
        }

        // TODO: Http Signatures spec supports empty string values
        if (!value) {
            throw new Error(`Header expected to exist and have value set ${headerField}`);
        }

        return value;
    }


    /**
     * Generates a valid Authorization signature header value
     * 
     * @param props 
     * @returns Authorization header signature
     */
    static buildSigningStringFromRequest(props: HttpSignatureRequestProps): string {

        const {
            requestPath,
            requestMethod,
            requiredHeaderFields,
            headers
        } = props;

        const requestQueryParams = props.requestQueryParams || {};

        // protect against receiving mixed query params in both path & requestQueryParams
        if (requestPath.includes('?')) {
            throw new Error(`Query parameters cannot be included in urlPath - specify as requestQueryParms`)
        }

        // NOTE: for now we'll omit all but the URL path to simplify processing
        // requests behind proxies, etc. but this should be improved in the future...
        // const normalizedUrl = parsedUrl.protocol + '//' + parsedUrl.host + parsedUrl.pathname
        const requestTargetTuple = [
            REQUEST_TARGET_FIELD,
            requestMethod.toLowerCase() + ' ' + requestPath
        ];

        // Proper handling of query params is not covered in the rfc, following
        // AWS HTTP Signature approach in this case.
        // see: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
        const queryTuples = Object.keys(requestQueryParams)
            .sort()
            .map((field) => {
                return [
                    field,
                    requestQueryParams[field] || '',
                ];
            });

        requiredHeaderFields.sort();
        const headerTuples = requiredHeaderFields.map((field) => {
            const value = HttpSignature.getHeaderValue(field, headers);
            return [field.toLowerCase(), value];
        });

        const signaturePayload = [requestTargetTuple]
            .concat(queryTuples)
            .concat(headerTuples)
            .map((nameValue) => `${nameValue[0]}: ${nameValue[1]}`).join(`\n`);

        log.debug("Signature payload", signaturePayload);
        return signaturePayload;
    }


    /**
     * Construct signature line from all params (requires signature)
     * 
     * @param params 
     * @returns 
     */
    protected buildSignatureLine(params: HttpSignatureParams) {

        const parts: string[] = [];
        for (const key of VALID_PARAMETERS) {
            const value = params[key];
            if (value !== null && value !== undefined) {
                parts.push(key + '="' + value + '"');
            } else if (REQUIRED_PARAMETERS.has(key)) {
                throw new Error(`Missing required value: ${key}`);
            }
        }

        const signatureLine = SIGNATURE_PREFIX + parts.join(',');

        return signatureLine;
    }



    /**
     * Parses an existing Http Auth signature line, returning the corresponding HttpSignatureParams object.
     * 
     * @param signatureLine 
     * @returns 
     */
    parseSignatureLine(signatureLine: string | undefined): HttpSignatureParams {
        if (!signatureLine) {
            throw new Error('signatureLine is required');
        }

        const parsed = signatureLine
            .replace(SIGNATURE_PREFIX, '')
            .split(PARAMETER_SEPARATOR_PATTERN)
            .map((it) => it.trim())
            .filter(it => it.length)
            .reduce((parsed, part) => {
                const keyValue = part
                    .split('=')

                if (keyValue.length !== 2) {
                    throw new Error(`failed to parse parameter`);
                }

                const key = keyValue[0].trim();
                const value = key === 'headers'
                    ? keyValue[1].replace(/"/g, '').split(/\s+/).map(it => it.trim())
                    : keyValue[1].replace(/"/g, '').trim();

                if (!VALID_PARAMETERS.has(key)) {
                    throw new Error(`unrecognized parameter`)
                }

                if (key in parsed) {
                    throw new Error('duplicate key found');
                }

                parsed[key] = value;
                return parsed;
            }, {});

        HttpSignature.validateHttpSignatureParams(parsed);

        return parsed;
    }

    protected static validateHttpSignatureParams(params: any)
        : asserts params is HttpSignatureParams {
        REQUIRED_PARAMETERS.forEach((requiredParam) => {
            if (params.hasOwnProperty(requiredParam) === false) {
                throw new Error(`signature missing ${requiredParam}`);
            }
        });
    }

}
