/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const { savedPeople, garPeople, flaggedSavedPeople } = require('../../fixtures');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const personApi = require('../../../common/services/personApi');
const garApi = require('../../../common/services/garApi');

const controller = require('../../../app/garfile/manifest/get.controller');

describe('Manifest Get Controller', () => {
  let req; let res; let clock;
  const APRIL = 3;


  beforeEach(() => {
    chai.use(sinonChai);
    clock = sinon.useFakeTimers({
      now: new Date(2023, APRIL, 11),
      shouldAdvanceTime: false,
      toFake: ["Date"],
    });

    apiResponse = {
      items: [{ garPeopleId: 1 }, { garPeopleId: 2 }],
    };

    req = {
      session: {
        gar: { id: '9001' },
        u: { dbId: 'USER-12345' },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
    clock.restore();
  });

  it('should return an error if person api rejects', () => {
    cookie = new CookieModel(req);
    sinon.stub(personApi, 'getPeople').rejects('Some reason here');
    sinon.stub(garApi, 'getPeople').resolves();

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(res.render).to.have.been.calledWith('app/garfile/manifest/index', {
        cookie, errors: [{ message: 'Failed to get manifest data' }],
      });
    });
  });

  it('should return an error if gar api rejects', () => {
    cookie = new CookieModel(req);
    sinon.stub(personApi, 'getPeople').resolves();
    sinon.stub(garApi, 'getPeople').rejects('garApi.getPeople Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(res.render).to.have.been.calledWith('app/garfile/manifest/index', {
        cookie, errors: [{ message: 'Failed to get manifest data' }],
      });
    });
  });

  describe('api calls resolve', () => {
    let personApiStub; let garApiStub;

    beforeEach(() => {
      personApiStub = sinon.stub(personApi, 'getPeople').resolves(JSON.stringify(savedPeople()));
      garApiStub = sinon.stub(garApi, 'getPeople').resolves(JSON.stringify({ 
        items: garPeople()
      }));
    });

    it('should render with errMsg populated', async () => {
      req.session.errMsg = { message: 'Example Error Message' };
      cookie = new CookieModel(req);

      await controller(req, res);

      expect(personApiStub).to.have.been.calledWith('USER-12345', 'individual');
      expect(garApiStub).to.have.been.calledWith('9001');
      expect(req.session.errMsg).to.be.undefined;
      expect(res.render).to.have.been.calledWith('app/garfile/manifest/index', {
        cookie,
        savedPeople: flaggedSavedPeople(),
        isInvalidSavedPeople: false,
        manifest: { items: garPeople() },
        errors: [{ message: 'Example Error Message' }],
      });
    });

    it('should render with manifestErr populated', async () => {
      req.session.manifestErr = [{ message: 'Wrong era' }];
      req.session.manifestInvalidPeople = [{ firstName: 'Jean-Luc', lastName: 'Picard' }];
      cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(personApiStub).to.have.been.calledWith('USER-12345', 'individual');
        expect(garApiStub).to.have.been.calledWith('9001');
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.manifestErr).to.be.undefined;
        expect(req.session.manifestInvalidPeople).to.be.undefined;
        expect(res.render).to.have.been.calledWith('app/garfile/manifest/index', {
          cookie,
          savedPeople: savedPeople(),
          manifest: { items: garPeople() },
          manifestInvalidPeople: [{ firstName: 'Jean-Luc', lastName: 'Picard' }],
          errors: [{ message: 'Wrong era' }],
        });
      });
    });

    it('should render with successMsg populated', async () => {
      req.session.successMsg = 'All present captain';
      cookie = new CookieModel(req);

      await controller(req, res);
  
      expect(personApiStub).to.have.been.calledWith('USER-12345', 'individual');
      expect(garApiStub).to.have.been.calledWith('9001');
      expect(req.session.successMsg).to.be.undefined;
      expect(res.render).to.have.been.calledWith('app/garfile/manifest/index', {
        cookie,
        savedPeople: savedPeople(),
        manifest: { items: garPeople() },
        successMsg: 'All present captain',
      });
    });

    it('should render without any extra parameters', async () => {
      cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(personApiStub).to.have.been.calledWith('USER-12345', 'individual');
        expect(garApiStub).to.have.been.calledWith('9001');
        expect(res.render).to.have.been.calledWith('app/garfile/manifest/index', {
          cookie,
          savedPeople: savedPeople(),
          manifest: { items: garPeople() },
        });
      });
    });
  });
});
