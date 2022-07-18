import HttpDigest from '../src/HttpDigest';

describe('#generateDigest()', () => {
    it('should return a digest string', () => {
        const body = 'this.is.a.test.'
        const expectedHash = 'SHA-256=GYIMCVE9eyStztxQnbGRjiXsEGiyu3miiwNTicSwIzs=';
        const digest = HttpDigest.generateDigest(body);

        expect(digest).toBe(expectedHash);
    });
});
