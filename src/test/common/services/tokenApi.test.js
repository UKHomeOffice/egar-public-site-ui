/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

require('../../global.test');

const config = require('../../../common/config/index');

describe('Token api service', () => {

  const { MFA_TOKEN_EXPIRY, MFA_TOKEN_MAX_ATTEMPTS } = config;

  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('validate token', () => {

  });
});
