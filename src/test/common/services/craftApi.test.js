const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const { URL } = require('url');
const nock = require('nock');

require('../../global.test');

const endpoints = require('../../../common/config/endpoints');
const config = require('../../../common/config/index');

const craftApi = require('../../../common/services/craftApi');

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
      const proxiedService = proxyquire('../../../common/services/craftApi', {
        request: { post: requestStub },
      });

      await proxiedService
        .create('RIP-AFTC', 'A380', 'LHR', 'USER-ID-1')
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              registration: 'RIP-AFTC',
              craftType: 'A380',
              craftBase: 'LHR',
            }),
            url: `${BASE_URL}/user/USER-ID-1/crafts`,
          });
        });
    });

    it('should reject if error present', async () => {
      const requestStub = sinon
        .stub()
        .yields(new Error('Example Error'), null, null);
      const proxiedService = proxyquire('../../../common/services/craftApi', {
        request: { post: requestStub },
      });

      const result = await proxiedService
        .create('RIP-AFTC', 'A380', 'LHR', 'USER-ID-1')
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              registration: 'RIP-AFTC',
              craftType: 'A380',
              craftBase: 'LHR',
            }),
            url: `${BASE_URL}/user/USER-ID-1/crafts`,
          });
        });
      expect(result).to.be.undefined;
    });

    it('should return if ok', async () => {
      const apiResponse = {
        craftId: 'NEW-ID',
      };
      const requestStub = sinon
        .stub()
        .yields(null, apiResponse, JSON.stringify(apiResponse));
      const proxiedService = proxyquire('../../../common/services/craftApi', {
        request: { post: requestStub },
      });

      const result = await proxiedService.create(
        'RIP-AFTC',
        'A380',
        'LHR',
        'USER-ID-1'
      );

      expect(requestStub).to.have.been.calledOnceWith({
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          registration: 'RIP-AFTC',
          craftType: 'A380',
          craftBase: 'LHR',
        }),
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
    nock(BASE_URL).post(`/user/${userId}/crafts`, craft).reply(201, {
      craftId: '1',
      registration: 'C89-yk18',
      craftType: 'Cessna 89',
      craftBase: 'Inverness Airport',
    });

    nock(BASE_URL).get(`/user/${userId}/crafts/${craftId}`).reply(200, {});

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

  it('should successfully create a craft', (done) => {
    craftApi
      .create(craft.registration, craft.craftType, craft.craftBase, userId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.property('craftId');
        done();
      });
  });

  it('should throw an error when creating a craft', (done) => {
    nock.cleanAll();
    nock(BASE_URL)
      .post(`/user/${userId}/crafts`, craft)
      .replyWithError({ message: 'Example create error', code: 404 });

    craftApi
      .create(craft.registration, craft.craftType, craft.craftBase, userId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example create error');
        done();
      });
  });

  it('should successfully list a crafts details', (done) => {
    craftApi.getDetails(userId, craftId).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when getting a crafts details', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/user/${userId}/crafts/${craftId}`)
      .replyWithError({ message: 'Example getDetails error', code: 404 });

    craftApi
      .getDetails(userId, craftId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example getDetails error');
      });
  });

  it('should successfully list all crafts an individual user is able to see', (done) => {
    craftApi.getCrafts(userId, 1).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when getting all crafts for an individual', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/user/${userId}/crafts?per_page=5&page=1`)
      .replyWithError({ message: 'Example getCrafts error', code: 404 });

    craftApi
      .getCrafts(userId, 1)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example getCrafts error');
      });
  });

  it('should successfully list all crafts an org user is able to see', (done) => {
    craftApi.getOrgCrafts(orgId, 1).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when getting all crafts for an organisation', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/organisations/${orgId}/crafts?per_page=5&page=1`)
      .replyWithError({ message: 'Example getCrafts error', code: 404 });

    craftApi
      .getOrgCrafts(orgId, 1)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example getCrafts error');
      });
  });

  it("should successfully update a craft's information", (done) => {
    craftApi
      .update(
        newCraft.registration,
        newCraft.craftType,
        newCraft.craftBase,
        userId,
        craftId
      )
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.property('craftId');
        done();
      });
  });

  it('should throw an error when updating a craft', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .put(`/user/${userId}/crafts/${craftId}`, newCraft)
      .replyWithError({ message: 'Example update error', code: 404 });

    craftApi
      .update(
        newCraft.registration,
        newCraft.craftType,
        newCraft.craftBase,
        userId,
        craftId
      )
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example update error');
      });
  });

  it('Should successfully delete a craft', (done) => {
    craftApi.deleteCraft(userId, craftId).then((apiResponse) => {
      const responseObj = JSON.parse(apiResponse);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when deleting a craft', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .delete(`/user/${userId}/crafts/${craftId}`, deleteCraft)
      .replyWithError({ message: 'Example deleteCraft error', code: 404 });

    craftApi
      .deleteCraft(userId, craftId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example deleteCraft error');
      });
  });

  it('should successfully delete an organisation craft', (done) => {
    craftApi.deleteOrgCraft(orgId, userId, craftId).then((apiResponse) => {
      const responseObj = JSON.parse(apiResponse);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when deleting an organisation craft', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .delete(`/organisations/${orgId}/crafts`, deleteCraft)
      .replyWithError({ message: 'Example deleteOrgCraft error', code: 404 });

    craftApi
      .deleteOrgCraft(orgId, userId, craftId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example deleteOrgCraft error');
      });
  });
});
