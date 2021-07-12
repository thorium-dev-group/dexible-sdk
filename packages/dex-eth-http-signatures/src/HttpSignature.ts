import {ethers} from 'ethers';
import Logger from 'dexible-logger';

const log = new Logger({component: "HttpSignature"});

const PARAMETER_SEPARATOR_PATTERN = /\s*,\s*/;

const SIGNATURE_PREFIX = 'Signature ';

const VALID_PARAMETERS = new Set([
    'keyId',
    'algorithm',
    'headers',
    'signature',
    // TODO: add support for created & expires params for message replay protection
    // 'created',
    // 'expires', 
]);

const REQUIRED_PARAMETERS = new Set([
    'keyId',
    'algorithm',
    'headers',
    'signature',
    // TODO: add support for created & expires params for message replay protection
    // 'created',
    // 'expires',
]);

export interface HttpSignatureParams {
    keyId: string
    algorithm: string
    headers: string
    signature: string
}

export interface HttpSignatureRequestProps {
    urlPath: string;
    requestMethod: string;
    requiredHeaderFields: Array<string>;
    headers: object;
};


export default abstract class HttpSignature {

    abstract generateSignatureString(wallet: ethers.Signer, requestProps) : Promise<string>

    abstract validate(parsedSignatureFields : HttpSignatureParams, requestProps) : Promise<void>

    static validateCommonFields(parsedSignatureFields : HttpSignatureParams, requestProps) : void {
        REQUIRED_PARAMETERS.forEach((requiredParam) => {
            if (parsedSignatureFields.hasOwnProperty(requiredParam) === false) {
                throw new Error(`signature missing ${requiredParam}`);
            }
        });
    }

    /**
     * Return a header value, lookup by original case first, falling back to lower case.
     * 
     * @param headerField 
     * @param headers 
     * @returns 
     */
    static getHeaderValue(headerField : string, headers : object) : string {
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
        if (! value) {
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
    static buildSigningStringFromRequest(props: HttpSignatureRequestProps) : string {

        const {
            urlPath,
            requestMethod,
            requiredHeaderFields,
            headers
        } = props;

        const REQUEST_TARGET_FIELD = '(request-target)';

        const requestTargetTuple = [
            REQUEST_TARGET_FIELD, 
            requestMethod.toLowerCase() + ' ' + urlPath
        ];

        const headerTuples = requiredHeaderFields.map((field) => {
            const value = HttpSignature.getHeaderValue(field, headers);
            return [field.toLowerCase(), value];
        });


        const signaturePayload = [requestTargetTuple]
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
        // TODO: verify required params exist...
        return SIGNATURE_PREFIX + Object.keys(params)
            .map((key) => `${key}="${params[key]}"`)
            .join(',');
    }


    /**
     * Parses an existing Http Auth signature line, returning the corresponding HttpSignatureParams object.
     * 
     * @param signatureLine 
     * @returns 
     */
    parseSignatureLine(signatureLine: string | undefined) : HttpSignatureParams {
        if (! signatureLine) {
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

            if (! VALID_PARAMETERS.has(key)) {
                throw new Error(`unrecognized parameter`)
            }

            if (key in parsed) {
                throw new Error('duplicate key found');
            }

            parsed[key] = value;
            return parsed;
        }, {});

        REQUIRED_PARAMETERS.forEach((requiredParam) => {
            if (parsed.hasOwnProperty(requiredParam) === false) {
                throw new Error(`signature missing ${requiredParam}`);
            }
        });

        // TODO: There is probably a better way to do this
        // than `as HttpSignatureParams` but this is good enough to
        // satisfy the TS compiler for now.
        return parsed as HttpSignatureParams;
    }

}
