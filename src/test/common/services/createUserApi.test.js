/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const { URL } = require('url');

require('../../global.test');

const config = require('../../../common/config/index');

describe('Create User API Service', () => {
  const { API_VERSION, API_BASE } = config;
  const BASE_URL = new URL(API_VERSION, API_BASE).href;

  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do nothing if request throws error', async () => {
    const requestStub = sinon.stub().throws('request.post Throw Error');
    const proxiedService = proxyquire('../../../common/services/createUserApi', {
      request: { post: requestStub },
    });

    await proxiedService.post('Darth', 'Vader', 'vader@sith.net');

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ firstName: 'Darth', lastName: 'Vader', email: 'vader@sith.net' }),
      url: `${BASE_URL}/user/register`,
    });
  });

  it('should reject if error present', async () => {
    const requestStub = sinon.stub().yields('Example Error', null, null);
    const proxiedService = proxyquire('../../../common/services/createUserApi', {
      request: { post: requestStub },
    });

    const result = await proxiedService.post('Darth', 'Vader', 'vader@sith.net');

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ firstName: 'Darth', lastName: 'Vader', email: 'vader@sith.net' }),
      url: `${BASE_URL}/user/register`,
    });
    expect(result).to.be.undefined;
  });

  it('should return if ok', async () => {
    const apiResponse = {
      garId: 'NEW-ID',
    };
    const requestStub = sinon.stub().yields(null, apiResponse, JSON.stringify(apiResponse));
    const proxiedService = proxyquire('../../../common/services/createUserApi', {
      request: { post: requestStub },
    });

    const result = await proxiedService.post('Darth', 'Vader', 'vader@sith.net');

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ firstName: 'Darth', lastName: 'Vader', email: 'vader@sith.net' }),
      url: `${BASE_URL}/user/register`,
    });
    expect(result).to.eql(JSON.stringify(apiResponse));
  });

  it('should return if ok with token', async () => {
    const apiResponse = {
      userId: 'NEW-ID',
    };
    const requestStub = sinon.stub().yields(null, apiResponse, JSON.stringify(apiResponse));
    const proxiedService = proxyquire('../../../common/services/createUserApi', {
      request: { post: requestStub },
    });

    const result = await proxiedService.post('Darth', 'Vader', 'vader@sith.net', 'TOKEN12345');

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Darth', lastName: 'Vader', email: 'vader@sith.net', tokenId: 'TOKEN12345',
      }),
      url: `${BASE_URL}/user/register`,
    });
    expect(result).to.eql(JSON.stringify(apiResponse));
  });
});
