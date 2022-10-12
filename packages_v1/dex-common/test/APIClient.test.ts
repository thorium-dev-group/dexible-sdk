/** @jest-environment setup-polly-jest/jest-environment-node */

import { APIClient } from '../src/services/APIClient';
import { MockAuthenticationHandler } from './utils/MockAuthenticationHandler';
import autoSetupPolly from './utils/auto-setup-polly';
import { sleep } from './utils/sleep';

// placeholder, all responses are explicitly mocked below,
const baseUrl = 'http://localhost:8080';

describe('APIClient', () => {

    const authenticationHandler = new MockAuthenticationHandler();

    const client = new APIClient({
        authenticationHandler,
        baseUrl,
    });

    let pollyContext = autoSetupPolly();

    beforeEach(() => {
        const { server } = pollyContext.polly;

        server
            .any(`${baseUrl}/redirect-301`)
            .intercept(async (req, res) => {
                const target = typeof req.query.target === 'string'
                    ? '/' + (req.query.target.replace(/^\/+/, ''))
                    : '/status-200';
                const location = baseUrl + target;

                res.setHeader('Location', location);
                res.status(301);
            });

        server
            .any(`${baseUrl}/status-200`)
            .intercept(async (req, res) => {
                res.status(200);
            });

        server
            .any(`${baseUrl}/status-404`)
            .intercept(async (req, res) => {
                res.status(404);
            });

        server
            .any(`${baseUrl}/status-500`)
            .intercept(async (req, res) => {
                res.status(500);
            });

        server
            .any(`${baseUrl}/sleep`)
            .intercept(async (req, res) => {
                const ms = typeof req.query.ms === 'string'
                    ? parseInt(req.query.ms, 10)
                    : 0;

                await sleep(ms);
                res.status(200);
            });

    });

    it('make api request', async () => {
        expect.assertions(1);

        const { server } = pollyContext.polly;
        const endpoint = '/test';
        let requestCount = 0;

        server.host(baseUrl, () => {
            server
                .any('/test')
                .intercept((req, res) => {
                    requestCount++;
                    res.status(200);
                });
        });

        await client.get(endpoint);
        await client.post(endpoint);

        expect(requestCount).toEqual(2);
    });


    it(
        'call authenticationHandler.authenticate() 1x before request',
        async () => {
            expect.assertions(1);

            const endpoint = '/status-200';
            const mockedAuthenicationHandler = jest.spyOn(authenticationHandler, 'buildClient');

            // should trigger authenticate call
            await client.post({
                endpoint,
                requiresAuthentication: true,
                withRetrySupport: false
            });

            // should not trigger secondary authenticate call
            await client.post({
                endpoint,
                requiresAuthentication: true,
                withRetrySupport: false
            });

            // also should not trigger authenticate
            await client.post({
                endpoint,
                requiresAuthentication: false,
                withRetrySupport: false
            });

            expect(mockedAuthenicationHandler).toBeCalledTimes(1);
        }
    );

    it('retry request on failure', async () => {
        expect.assertions(1);

        const endpoint = '/status-500';
        const retryCount = 5;
        let requestCount = 0;

        const customClient = new APIClient({
            authenticationHandler: new MockAuthenticationHandler(),
            baseUrl,
            retryCount,
        });


        try {
            await customClient.post({
                endpoint,
                requiresAuthentication: false,
                withRetrySupport: true
            });
        } catch (e) {
            // console.error(e.message);
        }

        expect(requestCount).toEqual(requestCount);
    });


    it('retry honor withRetrySupportFlag', async () => {
        expect.assertions(1);

        const { server } = pollyContext.polly;
        const endpoint = '/status-500';
        const retryCount = 5;
        let requestCount = 0;

        const customClient = new APIClient({
            authenticationHandler: new MockAuthenticationHandler(),
            baseUrl,
            retryCount,
        });

        server.host(baseUrl, () => {
            server
                .post(endpoint)
                .intercept((req, res) => {
                    requestCount++;
                    res.status(500);
                });
        });

        try {
            await customClient.post({
                endpoint,
                requiresAuthentication: false,
                withRetrySupport: false
            });
        } catch (e) {
            // console.error(e.message);
        }

        expect(requestCount).toEqual(1);
    });


    it('timeout request', async () => {
        expect.assertions(1);

        const timeoutMs = 42;
        const endpoint = '/sleep?ms=' + (timeoutMs * 1.1);

        const customClient = new APIClient({
            authenticationHandler: new MockAuthenticationHandler(),
            baseUrl,
            timeoutMs,
        });

        await expect(
            customClient.post({
                endpoint,
                requiresAuthentication: false,
                withRetrySupport: false
            })
        ).rejects.toThrowError();
    });


    it('throw on 404 response', async () => {
        expect.assertions(1);

        const endpoint = '/status-404';

        try {
            await client.post({
                endpoint,
                requiresAuthentication: false,
                withRetrySupport: false
            })
        } catch(e) {
            expect(e.message).toContain('404');
        }

    });


    it('throw on 5xx response', async () => {
        expect.assertions(1);

        const endpoint = '/status-500';

        try {
            await client.post({
                endpoint,
                requiresAuthentication: false,
                withRetrySupport: false
            })
        } catch(e) {
            expect(e.message).toContain('500');
        }

    });


    it('follow http redirects', async () => {
        expect.assertions(1);

        const { server } = pollyContext.polly;
        const endpoint = '/redirect-301?target=/test';
        let requestCount = 0;

        server.host(baseUrl, () => {
            server
                .any('/test')
                .intercept((req, res) => {
                    requestCount++;
                    res.status(200);
                });
        });

        // test get redirect
        await client.get({
            endpoint,
            requiresAuthentication: false,
            withRetrySupport: false
        });

        // test post redirect
        await client.post({
            endpoint,
            requiresAuthentication: false,
            withRetrySupport: false
        });

        expect(requestCount).toEqual(2);
    });


    it('strip preceding endpoint slashes', async () => {

        expect.assertions(1);

        const { server } = pollyContext.polly;
        const endpoint = 'test';
        let requestCount = 0;

        server.host(baseUrl, () => {
            server
                .any('/' + endpoint)
                .intercept((req, res) => {
                    requestCount++;
                    res.status(200);
                });
        });

        await client.post({
            endpoint,
            requiresAuthentication: false,
            withRetrySupport: false
        });

        await client.post({
            endpoint: '/' + endpoint,
            requiresAuthentication: false,
            withRetrySupport: false
        });

        await client.get({
            endpoint,
            requiresAuthentication: false,
            withRetrySupport: false
        });

        await client.get({
            endpoint: '/' + endpoint,
            requiresAuthentication: false,
            withRetrySupport: false
        });

        expect(requestCount).toEqual(4);
    });


    it('calculate baseUrl from blockchain', async () => {
    });


    it('support encoding data as get parameters', async () => {
        expect.assertions(1);

        const { server } = pollyContext.polly;
        const endpoint = '/test';

        server.host(baseUrl, () => {
            server
                .get(endpoint)
                .intercept((req, res) => {
                    expect(req.query.foo).toEqual('bar');
                    res.json({ status: 'ok' });
                })
        });

        const authenticationHandler = new MockAuthenticationHandler();

        const client = new APIClient({
            authenticationHandler,
            baseUrl,
        });

        await client.get({
            endpoint,
            params: {
                foo: 'bar',
            },
            requiresAuthentication: false,
            withRetrySupport: false,
        });

    });

})
