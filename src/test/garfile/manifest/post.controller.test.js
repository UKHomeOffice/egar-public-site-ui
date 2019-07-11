/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const manifestUtil = require('../../../app/garfile/manifest/bulkAdd');

const controller = require('../../../app/garfile/manifest/post.controller');

describe('Manifest Post Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    apiResponse = {
      items: [{ garPeopleId: 1 }, { garPeopleId: 2 }],
    };

    req = {
      body: {},
      session: {
        gar: { id: '9001' },
        u: { dbId: 'USER-12345' },
      },
      save: callback => callback(),
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect if no ids set and no buttonClicked set', () => {
    cookie = new CookieModel(req);
    sinon.stub(garApi, 'getPeople');
    sinon.stub(manifestUtil, 'getDetailsByIds');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.getPeople).to.not.have.been.called;
      expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
    });
  });

  // editPersonId
  // deletePersonId
  // personId:
  //   manifestUtil rejects
  //   manifestUtil resolves - garApi rejects
  //   manifestUtil resolves - garApi resolves

  it('should redirect if buttonClicked is Save and Exit', () => {
    req.body.buttonClicked = 'Save and Exit';
    cookie = new CookieModel(req);
    sinon.stub(garApi, 'getPeople');
    sinon.stub(manifestUtil, 'getDetailsByIds');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.getPeople).to.not.have.been.called;
      expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
    });
  });

  // saveAndContinue:
  it('should redirect with errors if buttonClicked is Save and Continue and gar api rejects', () => {
    req.body.buttonClicked = 'Save and continue';
    cookie = new CookieModel(req);
    sinon.stub(garApi, 'getPeople').rejects('garApi.getPeople Example Reject');
    sinon.stub(manifestUtil, 'getDetailsByIds');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.getPeople).to.have.been.calledWith('9001');
      expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
      // TODO: Assert that req session manifestErr is set to 'Failed to get manifest'
      expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
    });
  });
  //   garApi resolves - manifest invalid
  //   garApi resolves - manifest valid
});
