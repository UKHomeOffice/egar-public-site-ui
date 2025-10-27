const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const { URL } = require('url');

require('../../global.test');

const endpoints = require('../../../common/config/endpoints');
const config = require('../../../common/config/index');

describe('Responsible Person API Service', () => {
  const { API_VERSION, API_BASE } = config;
  const BASE_URL = new URL(API_VERSION, API_BASE).href;

  beforeEach(() => {
    chai.use(sinonChai);
  });

  const responsible_persons = [
    {
      responsiblePersonId: 'bc45f7d8-75e4-484d-9422-4a7c864e6bc9',
      responsibleGivenName: 'Sally',
      responsibleSurname: 'Smith',
      responsibleContactNo: '07878787878',
      responsibleEmail: 'testmail@181test.com',
      responsibleAddressLine1: 'House44',
      responsibleAddressLine2: 'Street33',
      responsibleTown: 'London',
      responsibleCountry: 'GBR',
      responsiblePostcode: 'GB66BG',
      fixedBasedOperator: 'Captain',
      fixedBasedOperatorAnswer: '',
    },
    {
      responsiblePersonId: '20bdec29-2a5d-41be-babe-906c80f5335c',
      responsibleGivenName: 'John',
      responsibleSurname: 'Smith',
      responsibleContactNo: '07878787878',
      responsibleEmail: 'testmail@816test.com',
      responsibleAddressLine1: 'House44',
      responsibleAddressLine2: 'Street33',
      responsibleTown: 'London',
      responsibleCountry: 'GBR',
      responsiblePostcode: 'GB66BG',
      fixedBasedOperator: 'Captain',
      fixedBasedOperatorAnswer: '',
    },
  ];

  const responsible_person = responsible_persons[0];

  afterEach(() => {
    sinon.restore();
  });

  describe('create responsible person', () => {
    it('should do nothing if request throws error', async () => {
      const requestStub = sinon.stub().throws('request.post Throw Error');
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { post: requestStub },
        }
      );

      await proxiedService
        .create('USER-ID-1', responsible_person)
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(responsible_person),
            url: `${BASE_URL}/user/USER-ID-1/responsiblepersons`,
          });
        });
    });

    it('should reject if error present', async () => {
      const requestStub = sinon
        .stub()
        .yields(new Error('Example Error'), null, null);
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { post: requestStub },
        }
      );

      const result = await proxiedService
        .create('USER-ID-1', responsible_person)
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(responsible_person),
            url: `${BASE_URL}/user/USER-ID-1/responsiblepersons`,
          });
        });
      expect(result).to.be.undefined;
    });

    it('should return if ok', async () => {
      const apiResponse = {
        responsible_person,
      };
      const requestStub = sinon
        .stub()
        .yields(null, apiResponse, JSON.stringify(apiResponse));
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { post: requestStub },
        }
      );

      const result = await proxiedService.create(
        'USER-ID-1',
        responsible_person
      );

      expect(requestStub).to.have.been.calledOnceWith({
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(responsible_person),
        url: `${BASE_URL}/user/USER-ID-1/responsiblepersons`,
      });
      expect(result).to.eql(JSON.stringify(apiResponse));
    });
  });

  describe('get responsible persons', () => {
    it('should do nothing if request throws error', async () => {
      const requestStub = sinon.stub().throws('request.get Throw Error');
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { get: requestStub },
        }
      );

      await proxiedService
        .getResPersons('USER-ID-1')
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            url: `${BASE_URL}/user/USER-ID-1/responsiblepersons`,
          });
        });
    });

    it('should reject if error present', async () => {
      const requestStub = sinon
        .stub()
        .yields(new Error('Example Error'), null, null);
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { get: requestStub },
        }
      );

      const result = await proxiedService
        .getResPersons('USER-ID-1')
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            url: `${BASE_URL}/user/USER-ID-1/responsiblepersons`,
          });
        });
      expect(result).to.be.undefined;
    });

    it('resPersonApi getResPersons should return if ok', async () => {
      const apiResponse = {
        responsible_persons,
      };
      const requestStub = sinon
        .stub()
        .yields(null, apiResponse, JSON.stringify(apiResponse));
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { get: requestStub },
        }
      );

      const result = await proxiedService.getResPersons('USER-ID-1');

      expect(requestStub).to.have.been.calledOnceWith({
        headers: { 'content-type': 'application/json' },
        url: `${BASE_URL}/user/USER-ID-1/responsiblepersons`,
      });
      expect(result).to.eql(JSON.stringify(apiResponse));
    });
  });

  describe('get responsible person details', () => {
    it('should do nothing if request throws error', async () => {
      const requestStub = sinon.stub().throws('request.get Throw Error');
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { get: requestStub },
        }
      );

      await proxiedService
        .getResPersonDetails('USER-ID-1', 'RES-PERSON-1')
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            url: `${BASE_URL}/user/USER-ID-1/responsibleperson/RES-PERSON-1`,
          });
        });
    });

    it('should reject if error present', async () => {
      const requestStub = sinon
        .stub()
        .yields(new Error('Example Error'), null, null);
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { get: requestStub },
        }
      );

      const result = await proxiedService
        .getResPersonDetails('USER-ID-1', 'RES-PERSON-1')
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            url: `${BASE_URL}/user/USER-ID-1/responsibleperson/RES-PERSON-1`,
          });
        });
      expect(result).to.be.undefined;
    });

    it('resPersonApi getResPersons should return if ok', async () => {
      const apiResponse = {
        responsible_person,
      };
      const requestStub = sinon
        .stub()
        .yields(null, apiResponse, JSON.stringify(apiResponse));
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { get: requestStub },
        }
      );

      const result = await proxiedService.getResPersonDetails(
        'USER-ID-1',
        'RES-PERSON-1'
      );

      expect(requestStub).to.have.been.calledOnceWith({
        headers: { 'content-type': 'application/json' },
        url: `${BASE_URL}/user/USER-ID-1/responsibleperson/RES-PERSON-1`,
      });
      expect(result).to.eql(JSON.stringify(apiResponse));
    });
  });

  describe('update responsible person details', () => {
    it('resPersonApi updateResPerson should do nothing if request throws error', async () => {
      const requestStub = sinon.stub().throws('request.post Throw Error');
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { put: requestStub },
        }
      );

      await proxiedService
        .updateResPerson('USER-ID-1', 'RES-PERSON-1', responsible_person)
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(responsible_person),
            url: `${BASE_URL}/user/USER-ID-1/responsibleperson/RES-PERSON-1`,
          });
        });
    });

    it('resPersonApi updateResPerson should reject if error present', async () => {
      const requestStub = sinon
        .stub()
        .yields(new Error('Example Error'), null, null);
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { put: requestStub },
        }
      );

      const result = await proxiedService
        .updateResPerson('USER-ID-1', 'RES-PERSON-1', responsible_person)
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(responsible_person),
            url: `${BASE_URL}/user/USER-ID-1/responsibleperson/RES-PERSON-1`,
          });
        });
      expect(result).to.be.undefined;
    });

    it('resPersonApi updateResPerson should return if ok', async () => {
      const apiResponse = {
        responsible_person,
      };
      const requestStub = sinon
        .stub()
        .yields(null, apiResponse, JSON.stringify(apiResponse));
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { put: requestStub },
        }
      );

      const result = await proxiedService.updateResPerson(
        'USER-ID-1',
        'RES-PERSON-1',
        responsible_person
      );

      expect(requestStub).to.have.been.calledOnceWith({
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(responsible_person),
        url: `${BASE_URL}/user/USER-ID-1/responsibleperson/RES-PERSON-1`,
      });
      expect(result).to.eql(JSON.stringify(apiResponse));
    });
  });

  describe('delete responsible person details', () => {
    it('resPersonApi deleteResponsiblePerson should do nothing if request throws error', async () => {
      const requestStub = sinon.stub().throws('request.delete Throw Error');
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { delete: requestStub },
        }
      );

      await proxiedService
        .deleteResponsiblePerson('USER-ID-1', 'RES-PERSON-1')
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            url: `${BASE_URL}/user/USER-ID-1/responsibleperson/RES-PERSON-1`,
          });
        });
    });

    it('resPersonApi deleteResponsiblePerson should reject if error present', async () => {
      const requestStub = sinon
        .stub()
        .yields(new Error('Example Error'), null, null);
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { delete: requestStub },
        }
      );

      const result = await proxiedService
        .deleteResponsiblePerson('USER-ID-1', 'RES-PERSON-1')
        .then()
        .catch(() => {
          expect(requestStub).to.have.been.calledOnceWith({
            headers: { 'content-type': 'application/json' },
            url: `${BASE_URL}/user/USER-ID-1/responsibleperson/RES-PERSON-1`,
          });
        });
      expect(result).to.be.undefined;
    });

    it('resPersonApi deleteResponsiblePerson should return if ok', async () => {
      const apiResponse = {};
      const requestStub = sinon
        .stub()
        .yields(null, apiResponse, JSON.stringify(apiResponse));
      const proxiedService = proxyquire(
        '../../../common/services/resPersonApi',
        {
          request: { delete: requestStub },
        }
      );

      const result = await proxiedService.deleteResponsiblePerson(
        'USER-ID-1',
        'RES-PERSON-1'
      );

      expect(requestStub).to.have.been.calledOnceWith({
        headers: { 'content-type': 'application/json' },
        url: `${BASE_URL}/user/USER-ID-1/responsibleperson/RES-PERSON-1`,
      });
      expect(result).to.eql(JSON.stringify(apiResponse));
    });
  });
});
