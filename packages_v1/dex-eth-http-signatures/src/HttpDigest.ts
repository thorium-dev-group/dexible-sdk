import { ethers } from 'ethers';
export default class HttpDigest {

    static generateDigest(body) {
        const bytes = ethers.utils.toUtf8Bytes(body);
        const bodyDigest = ethers.utils.sha256(bytes);
        return 'SHA-256=' + ethers.utils.base64.encode(bodyDigest);
    }

}
