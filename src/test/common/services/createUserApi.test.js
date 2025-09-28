/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import nock from 'nock';
import '../../global.test.js';
import endpoints from '../../../common/config/endpoints.js';
import registerApi from '../../../common/services/createUserApi.js';

const BASE_URL = endpoints.baseUrl();

describe('UserCreationService', () => {
  const user = {
    firstName: 'Shinobu',
    lastName: 'Oshino',
    email: 'soshino@email.com',
  };

  it('Should create a user and return the tokenId', async () => {
    nock(BASE_URL)
      .post('/user/register', user)
      .reply(201, { tokenId: '43f70daa-dc2e-4c88-af9c-f0dc1ff13a8e' });

    const response = await registerApi.post(user.firstName, user.lastName, user.email);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.have.keys(['tokenId']);
  });

  it('Should not create a user that already exists', async () => {
    nock(BASE_URL)
      .post('/user/register', user)
      .reply(400, { message: 'User already registered' });

    const response = await registerApi.post(user.firstName, user.lastName, user.email);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.have.keys(['message']);
    expect(responseObj.message).to.eq('User already registered');
  });

  it('Should enforce mandatory fields', async () => {
    const badUser = {
      firstName: 'Shinobu',
      lastName: 'Oshino',
    };
    nock(BASE_URL)
      .post('/user/register', badUser)
      .reply(400, { message: { email: 'This field is required' } });

    const response = await registerApi.post(user.firstName, user.lastName);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.have.keys(['message']);
    expect(responseObj.message.email).to.eq('This field is required');
  });

  it('Should successfully create an organisational user', async () => {
    const orgUser = {
      firstName: 'Shinobu',
      lastName: 'Oshino',
      email: 'soshino@email.com',
      tokenId: '1be8ed60-fd12-400b-9dc1-350447272199',
    };

    nock(BASE_URL)
      .post('/user/register', orgUser)
      .reply(201, { tokenId: '43f70daa-dc2e-4c88-af9c-f0dc1ff13aae' });

    const response = await registerApi.post(orgUser.firstName, orgUser.lastName, orgUser.email, orgUser.tokenId);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.have.keys(['tokenId']);
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
    const proxiedService = await esmock('../../../common/services/createUserApi.js', {
      'request': { post: requestStub },
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
    const proxiedService = await esmock('../../../common/services/createUserApi.js', {
      'request': { post: requestStub },
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
    const proxiedService = await esmock('../../../common/services/createUserApi.js', {
      'request': { post: requestStub },
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
    const proxiedService = await esmock('../../../common/services/createUserApi.js', {
      'request': { post: requestStub },
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