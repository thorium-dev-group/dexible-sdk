/** @jest-environment setup-polly-jest/jest-environment-node */
import path from "path";
import { setupPolly } from "setup-polly-jest";
import { Polly, PollyConfig } from "@pollyjs/core";

// https://github.com/gribnoysup/setup-polly-jest/issues/23
// import NodeHttpAdapter from "@pollyjs/adapter-node-http";
// import FSPersister from "@pollyjs/persister-fs";

// Polly.register(NodeHttpAdapter);
// Polly.register(FSPersister);

// let recordIfMissing = true;
// let mode: PollyConfig['mode'] = 'replay';

// switch (process.env.POLLY_MODE) {
//   case 'record':
//     mode = 'record';
//     break;
//   case 'replay':
//     mode = 'replay';
//     break;
//   case 'offline':
//     mode = 'replay';
//     recordIfMissing = false;
//     break;
// }

export default function autoSetupPolly() {
  return setupPolly({
    // 🟡 Note: In node, most `fetch` like libraries use the http/https modules.
    // `node-fetch` is handled by `NodeHttpAdapter`, NOT the `FetchAdapter`.
    adapters:  [require('@pollyjs/adapter-node-http')],
    // mode,
    // recordIfMissing,
    flushRequestsOnStop: true,
    logLevel: "silent",
    // recordFailedRequests: true,
    persister: require('@pollyjs/persister-fs'),
    persisterOptions: {
      fs: {
        recordingsDir: path.resolve(__dirname, "../../__recordings__"),
      },
    },
  });
}
