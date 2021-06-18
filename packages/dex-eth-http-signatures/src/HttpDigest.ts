import crypto from 'crypto';

export default class HttpDigest {

    static generateDigest(body) {
        const hash = crypto.createHash('sha256');
        hash.update(body)
        const bodyDigest = hash.digest('base64');
        return 'SHA-256=' + bodyDigest
    }

}
