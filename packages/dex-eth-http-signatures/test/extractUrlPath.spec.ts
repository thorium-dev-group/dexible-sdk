import { extractUrlPath } from '../src/utils';
describe('extractUrlPath', () => {

    it('should extract url path', () => {
        const tests = [
            {
                url: 'something-not-a-url',
                path: undefined,
            },
            {
                url: '/path/without/a/domain',
                path: undefined,
            },
            {
                url: 'ftp://only-site.com',
                path: '',
            },
            {
                url: 'http://site.fd/without/extension-page-80164560',
                path: '/without/extension-page-80164560',
            },
            {
                url: 'https://www.some.old/gagn/pfi.sdk',
                path: '/gagn/pfi.sdk',
            },
            {
                url: 'http://great.com/sid/link.php?id=2561',
                path: '/sid/link.php?id=2561',
            },
            {
                url: 'http://site.com/and/the/directory/withing/the/ending/file.ext',
                path: '/and/the/directory/withing/the/ending/file.ext',
            },
            {
                url: 'https://more-secure.org/ssl/is/good/and/files/better.don?parameters=20&shopt=15',
                path: '/ssl/is/good/and/files/better.don?parameters=20&shopt=15',
            },
            {
                url: 'ftp://and-server.fka-cdn.in/some/sort-of-a-server/with/nothing/but/files.dot?shopt=14',
                path: '/some/sort-of-a-server/with/nothing/but/files.dot?shopt=14',
            },
            {
                url: 'xmtp://non-exist.pro/tocol/has/advantages/in/non-knowing/hands.off?guilty=no',
                path: '/tocol/has/advantages/in/non-knowing/hands.off?guilty=no',
            },
            {
                url: 'http://smotret-anime.ru/translations/mp4/1036794?format=mp4&height=360',
                path: '/translations/mp4/1036794?format=mp4&height=360',
            },
            {
                url: 'http://and.th/the/hash/url#516',
                path: '/the/hash/url#516',
            }
        ];

        for (const test of tests) {
            const result = extractUrlPath(test.url);
            // console.log({
            //     url: test.url,
            //     path: test.path,
            //     result,
            // });
            expect(result).toEqual(test.path);
        }

    })

})
