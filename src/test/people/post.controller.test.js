/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../global.test');
const controller = require('../../app/people/post.controller');

describe('People Post Controller', () => {
  let req; let res; let sessionSaveStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      session: {
        u: { dbId: 'USER-DB-ID-1' },
        save: callback => callback(),
      },
    };
    res = {
      redirect: sinon.spy(),
    };

    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should just redirect back if body has nothing set', async () => {
    await controller(req, res);
    
    expect(req.session.deletePersonId).to.be.undefined;
    expect(req.session.editPersonId).to.be.undefined;
    expect(sessionSaveStub).to.not.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/people');
  });

  it('should redirect to delete if body has deletePerson', () => {
    req.body.deletePerson = 'ID_TO_DELETE';

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.deletePersonId).to.eq('ID_TO_DELETE');
      expect(req.session.editPersonId).to.be.undefined;
      expect(sessionSaveStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/people/delete');
    });
  });

  it('should redirect to edit if body has editPerson', () => {
    req.body.editPerson = 'ID_TO_EDIT';

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.deletePersonId).to.be.undefined;
      expect(req.session.editPersonId).to.eq('ID_TO_EDIT');
      expect(sessionSaveStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/people/edit');
    });
  });
});
