/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const personApi = require('../../../common/services/personApi');

const controller = require('../../../app/people/delete/get.controller');

describe('Person Delete Get Controller', () => {
  let req;
  let res;
  let personApiStub;
  let sessionSaveStub;
  let apiResponse;

  beforeEach(() => {
    chai.use(sinonChai);

    apiResponse = {
      firstName: 'Julian',
      lastName: 'Bashir',
    };

    req = {
      session: {
        u: { dbId: '343' },
        save: (callback) => callback(),
      },
    };

    res = {
      redirect: sinon.spy(),
    };

    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
    personApiStub = sinon.stub(personApi, 'deletePerson');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect back if no deletePersonId', () => {
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApiStub).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/people');
    });
  });

  it('should redirect back if api rejects', () => {
    req.session.deletePersonId = 'DELETE-PERSON-ID';
    personApiStub.rejects('personApi.getDetails Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApiStub).to.have.been.calledWith('343', 'DELETE-PERSON-ID');
      expect(req.session.errMsg).to.eql({
        message: 'Failed to delete person. Try again',
      });
      expect(res.redirect).to.have.been.calledOnceWithExactly('/people');
    });
  });

  it('should redirect with error messages if api returns one', () => {
    req.session.deletePersonId = 'DELETE-PERSON-ID';
    cookie = new CookieModel(req);

    personApiStub.resolves(
      JSON.stringify({
        message: 'Person id not found',
      })
    );

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApiStub).to.have.been.calledWith('343', 'DELETE-PERSON-ID');
      expect(req.session.errMsg).to.eql({
        message: 'Failed to delete person. Try again',
      });
      expect(sessionSaveStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/people');
    });
  });

  it('should redirect to people with success message if ok', () => {
    req.session.deletePersonId = 'DELETE-PERSON-ID';
    cookie = new CookieModel(req);

    personApiStub.resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApiStub).to.have.been.calledWith('343', 'DELETE-PERSON-ID');
      expect(req.session.successHeader).to.eq('Success');
      expect(req.session.successMsg).to.eq('Person deleted');
      expect(sessionSaveStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/people');
    });
  });
});
