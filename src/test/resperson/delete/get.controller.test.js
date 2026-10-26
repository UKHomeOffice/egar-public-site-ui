const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/resperson/delete/get.controller');

describe('Responsible Person Delete Get Controller', () => {
  let req;
  let res;
  let deleteStub;
  let saveStub;

  beforeEach(() => {
    req = {
      query: { deleteResponsiblePerson: 'person-1' },
      session: { u: { dbId: 'user-1' }, save: (callback) => callback() },
    };
    res = { redirect: sinon.spy() };
    saveStub = sinon.stub(req.session, 'save').callsArg(0);
    deleteStub = sinon.stub(dataAccessApi.resPersonApi, 'deleteResponsiblePerson');
  });

  afterEach(() => sinon.restore());

  it('redirects without calling the API if no ID is supplied', async () => {
    delete req.query.deleteResponsiblePerson;

    await controller(req, res);

    expect(deleteStub).not.to.have.been.called;
    expect(saveStub).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
  });

  it('saves the success message and redirects after deletion', async () => {
    deleteStub.resolves({});

    await controller(req, res);

    expect(deleteStub).to.have.been.calledOnceWithExactly('user-1', 'person-1');
    expect(req.session.errMsg).to.be.undefined;
    expect(req.session.successHeader).to.equal('Success');
    expect(req.session.successMsg).to.equal('Responsible is person deleted');
    expect(saveStub).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
  });

  ['message response', 'http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`saves an error and redirects without a success message on a ${type}`, async () => {
      const body = { message: 'Person not found' };
      if (type === 'message response') {
        deleteStub.resolves(body);
      } else {
        deleteStub.rejects(Object.assign(new Error('Request failed'), { type, status: 404, body }));
      }

      await controller(req, res);

      expect(deleteStub).to.have.been.calledOnceWithExactly('user-1', 'person-1');
      expect(req.session.errMsg).to.deep.equal({ message: 'Failed to delete responsible person. Try again' });
      expect(req.session.successHeader).to.be.undefined;
      expect(req.session.successMsg).to.be.undefined;
      expect(saveStub).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
    });
  });
});
