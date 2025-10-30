const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const nock = require('nock');

require('../../global.test');
const endpoints = require('../../../common/config/endpoints');
const registerApi = require('../../../common/services/createUserApi');

const BASE_URL = endpoints.baseUrl();

describe('UserCreationService', () => {
  const user = {
    firstName: 'Shinobu',
    lastName: 'Oshino',
    email: 'soshino@email.com',
  };

  it('Should create a user and return the tokenId', (done) => {
    nock(BASE_URL)
      .post('/user/register', user)
      .reply(201, { tokenId: '43f70daa-dc2e-4c88-af9c-f0dc1ff13a8e' });

    registerApi
      .post(user.firstName, user.lastName, user.email)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.keys(['tokenId']);
        done();
      });
  });

  it('Should not create a user that already exists', (done) => {
    nock(BASE_URL)
      .post('/user/register', user)
      .reply(400, { message: 'User already registered' });

    registerApi
      .post(user.firstName, user.lastName, user.email)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.keys(['message']);
        expect(responseObj.message).to.eq('User already registered');
        done();
      });
  });

  it('Should enforce mandatory fields', (done) => {
    const badUser = {
      firstName: 'Shinobu',
      lastName: 'Oshino',
    };
    nock(BASE_URL)
      .post('/user/register', badUser)
      .reply(400, { message: { email: 'This field is required' } });

    registerApi.post(user.firstName, user.lastName).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.have.keys(['message']);
      expect(responseObj.message.email).to.eq('This field is required');
      done();
    });
  });

  it('Should successfully create an organisational user', (done) => {
    const orgUser = {
      firstName: 'Shinobu',
      lastName: 'Oshino',
      email: 'soshino@email.com',
      tokenId: '1be8ed60-fd12-400b-9dc1-350447272199',
    };

    nock(BASE_URL)
      .post('/user/register', orgUser)
      .reply(201, { tokenId: '43f70daa-dc2e-4c88-af9c-f0dc1ff13aae' });

    registerApi
      .post(orgUser.firstName, orgUser.lastName, orgUser.email, orgUser.tokenId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.keys(['tokenId']);
        done();
      });
  });
});

describe('Create User API Service', () => {
  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do nothing if request throws error', async () => {
    const requestStub = sinon.stub().throws('request.post Throw Error');
    const proxiedService = proxyquire(
      '../../../common/services/createUserApi',
      {
        request: { post: requestStub },
      }
    );

    await proxiedService.post('Darth', 'Vader', 'vader@sith.net');

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Darth',
        lastName: 'Vader',
        email: 'vader@sith.net',
      }),
      url: `${BASE_URL}/user/register`,
    });
  });

  it('should reject if error present', async () => {
    const requestStub = sinon.stub().yields('Example Error', null, null);
    const proxiedService = proxyquire(
      '../../../common/services/createUserApi',
      {
        request: { post: requestStub },
      }
    );

    const result = await proxiedService.post(
      'Darth',
      'Vader',
      'vader@sith.net'
    );

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Darth',
        lastName: 'Vader',
        email: 'vader@sith.net',
      }),
      url: `${BASE_URL}/user/register`,
    });
    expect(result).to.be.undefined;
  });

  it('should return if ok', async () => {
    const apiResponse = {
      garId: 'NEW-ID',
    };
    const requestStub = sinon
      .stub()
      .yields(null, apiResponse, JSON.stringify(apiResponse));
    const proxiedService = proxyquire(
      '../../../common/services/createUserApi',
      {
        request: { post: requestStub },
      }
    );

    const result = await proxiedService.post(
      'Darth',
      'Vader',
      'vader@sith.net'
    );

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Darth',
        lastName: 'Vader',
        email: 'vader@sith.net',
      }),
      url: `${BASE_URL}/user/register`,
    });
    expect(result).to.eql(JSON.stringify(apiResponse));
  });

  it('should return if ok with token', async () => {
    const apiResponse = {
      userId: 'NEW-ID',
    };
    const requestStub = sinon
      .stub()
      .yields(null, apiResponse, JSON.stringify(apiResponse));
    const proxiedService = proxyquire(
      '../../../common/services/createUserApi',
      {
        request: { post: requestStub },
      }
    );

    const result = await proxiedService.post(
      'Darth',
      'Vader',
      'vader@sith.net',
      'TOKEN12345'
    );

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Darth',
        lastName: 'Vader',
        email: 'vader@sith.net',
        tokenId: 'TOKEN12345',
      }),
      url: `${BASE_URL}/user/register`,
    });
    expect(result).to.eql(JSON.stringify(apiResponse));
  });
});
