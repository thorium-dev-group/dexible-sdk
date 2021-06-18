import {expect} from 'chai';
import HttpDigest from './HttpDigest';

describe('#generateDigest()', () => {
    const body = 'this.is.a.test.'
    const digest = HttpDigest.generateDigest(body);
    it('should return a digest string', () => {
        expect(digest).to.be.a('string');
    })
});
