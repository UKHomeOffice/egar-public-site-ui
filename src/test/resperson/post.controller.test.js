const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../global.test');
const CookieModel = require('../../common/models/Cookie.class');
const resPersonApi = require('../../common/services/resPersonApi');

const controller = require('../../app/resperson/post.controller');


describe('Responsible Person Index Post Controller', () => {

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

  it('should just redirect to responsible person index controller', async () => {

    await controller(req, res);
    
    expect(req.session.deleteResponsiblePersonId).to.be.undefined;
    expect(req.session.editResponsiblePersonId).to.be.undefined;
    expect(sessionSaveStub).to.not.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/resperson');
  });

  it('should redirect to delete resperson if body has deleteResponsiblePersonId', () => {
    req.body.deleteResponsiblePerson = 'ID_TO_DELETE';

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.deleteResponsiblePersonId).to.eq('ID_TO_DELETE');
      expect(req.session.editResponsiblePersonId).to.be.undefined;
      expect(sessionSaveStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/resPerson/delete');
    });
  });

  it('should redirect to edit resperson if body has editPerson', () => {
    req.body.editResponsiblePerson = 'ID_TO_EDIT';

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.deleteResponsiblePersonId).to.be.undefined;
      expect(req.session.editResponsiblePersonId).to.eq('ID_TO_EDIT');
      expect(sessionSaveStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/resPerson/edit');
    });
  });

});