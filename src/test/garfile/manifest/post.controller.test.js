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
        save: callback => callback(),
      },
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

  it('should redirect to editperson', () => {
    req.body.editPersonId = '123456';
    sinon.stub(req.session, 'save').callsArg(0);
    sinon.stub(garApi, 'getPeople');
    sinon.stub(manifestUtil, 'getDetailsByIds');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(req.session.editPersonId).to.eq('123456');
      expect(garApi.getPeople).to.not.have.been.called;
      expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
      expect(req.session.save).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/garfile/manifest/editperson');
    });
  });

  it('should redirect to deleteperson', () => {
    req.body.deletePersonId = '987654';
    sinon.stub(req.session, 'save').callsArg(0);
    sinon.stub(garApi, 'getPeople');
    sinon.stub(manifestUtil, 'getDetailsByIds');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(req.session.deletePersonId).to.eq('987654');
      expect(garApi.getPeople).to.not.have.been.called;
      expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
      expect(req.session.save).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/garfile/manifest/deleteperson');
    });
  });

  // TODO: It really should inform the user of an issue...
  it('should redirect if garApi rejects', () => {
    req.body.personId = 'ABCDEFG';
    sinon.stub(garApi, 'patch').rejects('garApi.patch Example Reject');
    sinon.stub(manifestUtil, 'getDetailsByIds').rejects('bulkAdd.getDetailsByIds Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(manifestUtil.getDetailsByIds).to.have.been.calledWith('ABCDEFG', 'USER-12345');
      expect(garApi.patch).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
    });
  });

  // TODO: It really should inform the user of an issue...
  it('should redirect if garApi rejects', () => {
    req.body.personId = 'ABCDEFG';
    sinon.stub(garApi, 'patch').rejects('garApi.patch Example Reject');
    sinon.stub(manifestUtil, 'getDetailsByIds').resolves([
      { firstName: 'Random', lastName: 'Person' },
    ]);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(manifestUtil.getDetailsByIds).to.have.been.calledWith('ABCDEFG', 'USER-12345');
      expect(garApi.patch).to.have.been.calledWith('9001', 'Draft', { people: [{ firstName: 'Random', lastName: 'Person' }] });
      expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
    });
  });

  it('should redirect if garApi resolves', () => {
    req.body.personId = 'ABCDEFG';
    sinon.stub(garApi, 'patch').resolves();
    sinon.stub(manifestUtil, 'getDetailsByIds').resolves([
      { firstName: 'Random', lastName: 'Person' },
    ]);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(manifestUtil.getDetailsByIds).to.have.been.calledWith('ABCDEFG', 'USER-12345');
      expect(garApi.patch).to.have.been.calledWith('9001', 'Draft', { people: [{ firstName: 'Random', lastName: 'Person' }] });
      expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
    });
  });

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
  it('should redirect with errors if buttonClicked is Save and Continue and gar api resolves but is invalid', () => {
    req.body.buttonClicked = 'Save and continue';
    cookie = new CookieModel(req);
    // sinon.stub(Manifest.prototype, 'validate').returns(false);
    sinon.stub(garApi, 'getPeople').resolves(JSON.stringify({
      items: [
        { firstName: 'James', lastName: 'Kirk', date: '2012-13-34' },
        { firstName: 'S\'chn T\'gai', lastName: 'Spock', date: '2012-13-34' },
      ],
    }));
    sinon.stub(manifestUtil, 'getDetailsByIds');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.getPeople).to.have.been.calledWith('9001');
      expect(manifestUtil.getDetailsByIds).to.not.have.been.called;

      expect(req.session.manifestErr).to.eql([
        { message: 'Click the edit link of the person(s) with the errors to edit and correct their details.', identifier: 'person-0' },
        { message: 'Click the edit link of the person(s) with the errors to edit and correct their details.', identifier: 'person-1' },
      ]);
      expect(req.session.manifestInvalidPeople).to.eql(['person-0', 'person-1']);

      expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
    });
  });

  it('should redirect to next page if buttonClicked is Save and Continue and gar api resolves', () => {
    req.body.buttonClicked = 'Save and continue';
    cookie = new CookieModel(req);
    // sinon.stub(Manifest.prototype, 'validate').returns(false);
    sinon.stub(garApi, 'getPeople').resolves(JSON.stringify({
      items: [
        { firstName: 'James', lastName: 'Kirk' },
        { firstName: 'S\'chn T\'gai', lastName: 'Spock' },
      ],
    }));
    sinon.stub(manifestUtil, 'getDetailsByIds');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.getPeople).to.have.been.calledWith('9001');
      expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
      expect(req.session.manifestErr).to.be.undefined;
      expect(req.session.manifestInvalidPeople).to.be.undefined;
      expect(res.redirect).to.have.been.calledWith('/garfile/responsibleperson');
    });
  });
});
