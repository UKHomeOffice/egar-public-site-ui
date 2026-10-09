const chai = require('chai');
const i18n = require('i18n');
const path = require('path');
const { before, after } = require('mocha');

process.env.NOTIFY_API_KEY = process.env.NOTIFY_API_KEY || 'test-notify-key';

i18n.configure({
  locales: ['en'],
  directory: path.join(__dirname, '../locales'),
  objectNotation: true,
  defaultLocale: 'en',
  register: global,
});

const unhandledRejectionHandler = (reason, promise) => {
  chai.assert.fail(`Unhandled rejection encountered: ${reason} for promise: ${promise}`);
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
