/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import { URL } from 'url';
import nock from 'nock';
import '../../global.test.js';
import endpoints from '../../../common/config/endpoints.js';
import config from '../../../common/config/index.js';
import craftApi from '../../../common/services/craftApi.js';

describe('Craft API Service', () => {
  const { API_VERSION, API_BASE } = config;
  const BASE_URL = new URL(API_VERSION, API_BASE).href;

  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('create', () => {
    it('should do nothing if request throws error', async () => {
      const requestStub = sinon.stub().throws('request.post Throw Error');
      const proxiedService = await esmock('../../../common/services/craftApi.js', {
        'request': { post: requestStub },
      });

      await proxiedService.create('RIP-AFTC', 'A380', 'LHR', 'USER-ID-1').then().catch(() => {
        expect(requestStub).to.have.been.calledOnceWith({
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ registration: 'RIP-AFTC', craftType: 'A380', craftBase: 'LHR' }),
          url: `${BASE_URL}/user/USER-ID-1/crafts`,
        });
      });
    });

    it('should reject if error present', async () => {
      const requestStub = sinon.stub().yields(new Error('Example Error'), null, null);
      const proxiedService = await esmock('../../../common/services/craftApi.js', {
        'request': { post: requestStub },
      });

      const result = await proxiedService.create('RIP-AFTC', 'A380', 'LHR', 'USER-ID-1').then().catch(() => {
        expect(requestStub).to.have.been.calledOnceWith({
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ registration: 'RIP-AFTC', craftType: 'A380', craftBase: 'LHR' }),
          url: `${BASE_URL}/user/USER-ID-1/crafts`,
        });
      });
      expect(result).to.be.undefined;
    });

    it('should return if ok', async () => {
      const apiResponse = {
        craftId: 'NEW-ID',
      };
      const requestStub = sinon.stub().yields(null, apiResponse, JSON.stringify(apiResponse));
      const proxiedService = await esmock('../../../common/services/craftApi.js', {
        'request': { post: requestStub },
      });

      const result = await proxiedService.create('RIP-AFTC', 'A380', 'LHR', 'USER-ID-1');

      expect(requestStub).to.have.been.calledOnceWith({
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ registration: 'RIP-AFTC', craftType: 'A380', craftBase: 'LHR' }),
        url: `${BASE_URL}/user/USER-ID-1/crafts`,
      });
      expect(result).to.eql(JSON.stringify(apiResponse));
    });
  });

  // Either flesh these out, or use the nock to handle error situations...
  // getDetails
  // getCrafts
  // getOrgCrafts
  // deleteCrafts
  // deleteOrgCrafts
});

describe('CraftService With Nock', () => {
  const userId = '43f70daa-dc2e-4c88-af9c-f0dc1ff13a8e';
  const craftId = '43f70daa-dc2e-4c88-cccc-f0dc1ff13a8e';
  const orgId = '43f70daa-dc2e-9888-cccc-f0dc1ff13a8e';
  const craft = {
    registration: 'C89-yk18',
    craftType: 'Cessna 89',
    craftBase: 'Inverness Airport',
  };
  const newCraft = {
    registration: 'B20-yk10',
    craftType: 'Cessna 89',
    craftBase: 'Inverness Airport',
  };

  const deleteCraft = {
    requesterId: userId,
    crafts: [{ craftId }],
  };

  const BASE_URL = endpoints.baseUrl();

  beforeEach(() => {
    nock(BASE_URL)
      .post(`/user/${userId}/crafts`, craft)
      .reply(201, {
        craftId: '1',
        registration: 'C89-yk18',
        craftType: 'Cessna 89',
        craftBase: 'Inverness Airport',
      });

    nock(BASE_URL)
      .get(`/user/${userId}/crafts/${craftId}`)
      .reply(200, {});

    nock(BASE_URL)
      .get(`/organisations/${orgId}/crafts?per_page=5&page=1`)
      .reply(200, {});

    nock(BASE_URL)
      .get(`/user/${userId}/crafts?per_page=5&page=1`)
      .reply(200, {});

    nock(BASE_URL)
      .put(`/user/${userId}/crafts/${craftId}`, newCraft)
      .reply(201, {
        craftId: '1',
        registration: 'B20-yk10',
        craftType: 'Cessna 89',
        craftBase: 'Inverness Airport',
      });

    nock(BASE_URL)
      .delete(`/user/${userId}/crafts/${craftId}`, deleteCraft)
      .reply(200, {});

    nock(BASE_URL)
      .delete(`/organisations/${orgId}/crafts`, deleteCraft)
      .reply(200, {});
  });

  it('should successfully create a craft', async () => {
    const response = await craftApi.create(craft.registration, craft.craftType, craft.craftBase, userId);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.have.property('craftId');
  });

  it('should throw an error when creating a craft', async () => {
    nock.cleanAll();
    nock(BASE_URL)
      .post(`/user/${userId}/crafts`, craft)
      .replyWithError({ message: 'Example create error', code: 404 });

    try {
      await craftApi.create(craft.registration, craft.craftType, craft.craftBase, userId);
      chai.assert.fail('Should not have returned without error');
    } catch (err) {
      expect(err.message).to.equal('Example create error');
    }
  });

  it('should successfully list a crafts details', async () => {
    const response = await craftApi.getDetails(userId, craftId);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.be.empty;
  });

  it('should throw an error when getting a crafts details', async () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/user/${userId}/crafts/${craftId}`)
      .replyWithError({ message: 'Example getDetails error', code: 404 });

    try {
      await craftApi.getDetails(userId, craftId);
      chai.assert.fail('Should not have returned without error');
    } catch (err) {
      expect(err.message).to.equal('Example getDetails error');
    }
  });

  it('should successfully list all crafts an individual user is able to see', async () => {
    const response = await craftApi.getCrafts(userId, 1);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.be.empty;
  });

  it('should throw an error when getting all crafts for an individual', async () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/user/${userId}/crafts?per_page=5&page=1`)
      .replyWithError({ message: 'Example getCrafts error', code: 404 });

    try {
      await craftApi.getCrafts(userId, 1);
      chai.assert.fail('Should not have returned without error');
    } catch (err) {
      expect(err.message).to.equal('Example getCrafts error');
    }
  });

  it('should successfully list all crafts an org user is able to see', async () => {
    const response = await craftApi.getOrgCrafts(orgId, 1);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.be.empty;
  });

  it('should throw an error when getting all crafts for an organisation', async () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/organisations/${orgId}/crafts?per_page=5&page=1`)
      .replyWithError({ message: 'Example getCrafts error', code: 404 });

    try {
      await craftApi.getOrgCrafts(orgId, 1);
      chai.assert.fail('Should not have returned without error');
    } catch (err) {
      expect(err.message).to.equal('Example getCrafts error');
    }
  });

  it("should successfully update a craft's information", async () => {
    const response = await craftApi.update(newCraft.registration, newCraft.craftType, newCraft.craftBase, userId, craftId);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.have.property('craftId');
  });

  it('should throw an error when updating a craft', async () => {
    nock.cleanAll();
    nock(BASE_URL)
      .put(`/user/${userId}/crafts/${craftId}`, newCraft)
      .replyWithError({ message: 'Example update error', code: 404 });

    try {
      await craftApi.update(newCraft.registration, newCraft.craftType, newCraft.craftBase, userId, craftId);
      chai.assert.fail('Should not have returned without error');
    } catch (err) {
      expect(err.message).to.equal('Example update error');
    }
  });

  it('Should successfully delete a craft', async () => {
    const apiResponse = await craftApi.deleteCraft(userId, craftId);
    const responseObj = JSON.parse(apiResponse);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.be.empty;
  });

  it('should throw an error when deleting a craft', async () => {
    nock.cleanAll();
    nock(BASE_URL)
      .delete(`/user/${userId}/crafts/${craftId}`, deleteCraft)
      .replyWithError({ message: 'Example deleteCraft error', code: 404 });

    try {
      await craftApi.deleteCraft(userId, craftId);
      chai.assert.fail('Should not have returned without error');
    } catch (err) {
      expect(err.message).to.equal('Example deleteCraft error');
    }
  });

  it('should successfully delete an organisation craft', async () => {
    const apiResponse = await craftApi.deleteOrgCraft(orgId, userId, craftId);
    const responseObj = JSON.parse(apiResponse);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.be.empty;
  });

  it('should throw an error when deleting an organisation craft', async () => {
    nock.cleanAll();
    nock(BASE_URL)
      .delete(`/organisations/${orgId}/crafts`, deleteCraft)
      .replyWithError({ message: 'Example deleteOrgCraft error', code: 404 });

    try {
      await craftApi.deleteOrgCraft(orgId, userId, craftId);
      chai.assert.fail('Should not have returned without error');
    } catch (err) {
      expect(err.message).to.equal('Example deleteOrgCraft error');
    }
  });
});