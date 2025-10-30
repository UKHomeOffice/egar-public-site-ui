const chai = require('chai');
const { before, after } = require('mocha');

const unhandledRejectionHandler = (reason, promise) => {
  chai.assert.fail(
    `Unhandled rejection encountered: ${reason} for promise: ${promise}`
  );
};

/**
 * Rather than copy paste the unhandled rejection handler, set it here to be added
 * and removed after test runs.
 */
before(() => {
  process.on('unhandledRejection', unhandledRejectionHandler);
});

after(() => {
  process.removeListener('unhandledRejection', unhandledRejectionHandler);
});
