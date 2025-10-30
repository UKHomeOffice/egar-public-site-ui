/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const { garPeople, invalidPassengersAndCrew } = require('../../fixtures');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const personApi = require('../../../common/services/personApi');
const manifestUtil = require('../../../app/garfile/manifest/bulkAdd');

const controller = require('../../../app/garfile/manifest/post.controller');

describe('Manifest Post Controller', () => {
  let req;
  let res;

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
        save: (callback) => callback(),
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

    callController()
      .then()
      .then(() => {
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

    callController()
      .then()
      .then(() => {
        expect(req.session.editPersonId).to.eq('123456');
        expect(garApi.getPeople).to.not.have.been.called;
        expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
        expect(req.session.save).to.have.been.called;
        expect(res.redirect).to.have.been.calledWith(
          '/garfile/manifest/editperson'
        );
      });
  });

  // TODO: It really should inform the user of an issue...
  it('should redirect if garApi rejects', () => {
    req.body.buttonClicked = 'Add to GAR';
    req.body.personId = 'ABCDEFG';
    sinon.stub(garApi, 'patch').rejects('garApi.patch Example Reject');
    sinon
      .stub(manifestUtil, 'getDetailsByIds')
      .rejects('bulkAdd.getDetailsByIds Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(manifestUtil.getDetailsByIds).to.have.been.calledWith(
          'ABCDEFG',
          'USER-12345'
        );
        expect(garApi.patch).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
      });
  });

  // TODO: It really should inform the user of an issue...
  it('should redirect if garApi rejects', () => {
    req.body.buttonClicked = 'Add to GAR';
    req.body.personId = 'ABCDEFG';
    sinon.stub(garApi, 'patch').rejects('garApi.patch Example Reject');
    sinon
      .stub(manifestUtil, 'getDetailsByIds')
      .resolves([{ firstName: 'Random', lastName: 'Person' }]);

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(manifestUtil.getDetailsByIds).to.have.been.calledWith(
          'ABCDEFG',
          'USER-12345'
        );
        expect(garApi.patch).to.have.been.calledWith('9001', 'Draft', {
          people: [{ firstName: 'Random', lastName: 'Person' }],
        });
        expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
      });
  });

  it('should redirect if garApi resolves', () => {
    req.body.buttonClicked = 'Add to GAR';
    req.body.personId = 'ABCDEFG';
    sinon.stub(garApi, 'patch').resolves();
    sinon
      .stub(manifestUtil, 'getDetailsByIds')
      .resolves([{ firstName: 'Random', lastName: 'Person' }]);

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(manifestUtil.getDetailsByIds).to.have.been.calledWith(
          'ABCDEFG',
          'USER-12345'
        );
        expect(garApi.patch).to.have.been.calledWith('9001', 'Draft', {
          people: [{ firstName: 'Random', lastName: 'Person' }],
        });
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

    callController()
      .then()
      .then(() => {
        expect(garApi.getPeople).to.not.have.been.called;
        expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
      });
  });

  it('should redirect if buttonClicked is Save and Exit even if personId set', () => {
    req.body.buttonClicked = 'Save and Exit';
    req.body.personId = ['ABCDEFG', 'HIJKLMN'];
    cookie = new CookieModel(req);
    sinon.stub(garApi, 'getPeople');
    sinon.stub(manifestUtil, 'getDetailsByIds');

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(garApi.getPeople).to.not.have.been.called;
        expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
      });
  });

  it('Add people button was called', () => {
    req.body.buttonClicked = 'Add to PEOPLE';
    req.body.garPeopleId = ['1234', '5678'];
    cookie = new CookieModel(req);
    sinon.stub(personApi, 'create').resolves(true);
    sinon.stub(manifestUtil, 'getgarPeopleIds').resolves(garPeople());

    const callController = async () => {
      await controller(req, res);
    };
    callController()
      .then()
      .then(() => {
        expect(manifestUtil.getgarPeopleIds).to.have.been.called;
        expect(personApi.create).to.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
      });
  });

  it('should redirect with errors if buttonClicked is Continue and gar api rejects', async () => {
    req.body.buttonClicked = 'Continue';
    cookie = new CookieModel(req);

    sinon.stub(garApi, 'patch').resolves(true);
    sinon.stub(garApi, 'getPeople').rejects('garApi.getPeople Example Reject');
    sinon.stub(manifestUtil, 'getDetailsByIds');

    await controller(req, res);

    expect(garApi.getPeople).to.have.been.calledWith('9001');
    expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
    // TODO: Assert that req session manifestErr is set to 'Failed to get manifest'
    expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
  });
  //   garApi resolves - manifest invalid
  //   garApi resolves - manifest valid
  it('should redirect with errors if buttonClicked is Continue and gar api resolves but is invalid', async () => {
    req.body.buttonClicked = 'Continue';
    cookie = new CookieModel(req);
    // sinon.stub(Manifest.prototype, 'validate').returns(false);
    sinon.stub(garApi, 'patch').resolves(true);
    sinon.stub(garApi, 'getPeople').resolves(
      JSON.stringify({
        items: invalidPassengersAndCrew(),
      })
    );
    sinon.stub(manifestUtil, 'getDetailsByIds');

    await controller(req, res);

    expect(garApi.getPeople).to.have.been.calledWith('9001');
    expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
    expect(req.session.manifestErr).to.eql([
      {
        message:
          'Click the edit link of the person(s) with the errors to edit and correct their details.',
        identifier: 'person-0',
      },
      {
        message:
          'Click the edit link of the person(s) with the errors to edit and correct their details.',
        identifier: 'person-1',
      },
    ]);
    expect(req.session.manifestInvalidPeople).to.eql(['person-0', 'person-1']);
    expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
  });

  it('should redirect to next page if buttonClicked is Continue and gar api resolves', async () => {
    req.body.buttonClicked = 'Continue';
    cookie = new CookieModel(req);
    // sinon.stub(Manifest.prototype, 'validate').returns(false);
    sinon.stub(garApi, 'patch').resolves(true);
    sinon.stub(garApi, 'getPeople').resolves(
      JSON.stringify({
        items: garPeople(),
      })
    );
    sinon.stub(manifestUtil, 'getDetailsByIds');

    await controller(req, res);

    expect(garApi.getPeople).to.have.been.calledWith('9001');
    expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
    expect(req.session.manifestErr).to.be.undefined;
    expect(req.session.manifestInvalidPeople).to.be.undefined;
    expect(res.redirect).to.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/garfile/resperson');
  });

  it('should redirect to next page if buttonClicked is Continue and gar api resolves even if personId set', async () => {
    req.body.buttonClicked = 'Continue';
    req.body.personId = ['ABCDEFG', 'HIJKLMN'];
    cookie = new CookieModel(req);
    // sinon.stub(Manifest.prototype, 'validate').returns(false);
    sinon.stub(garApi, 'patch').resolves(true);
    sinon.stub(garApi, 'getPeople').resolves(
      JSON.stringify({
        items: garPeople(),
      })
    );
    sinon.stub(manifestUtil, 'getDetailsByIds');

    await controller(req, res);

    expect(garApi.getPeople).to.have.been.calledWith('9001');
    expect(manifestUtil.getDetailsByIds).to.not.have.been.called;
    expect(req.session.manifestErr).to.be.undefined;
    expect(req.session.manifestInvalidPeople).to.be.undefined;
    expect(res.redirect).to.have.been.calledWith('/garfile/resperson');
  });
});
