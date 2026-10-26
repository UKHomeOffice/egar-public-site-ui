const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/aircraft/delete/get.controller');

describe('Aircraft Delete Get Controller', () => {
  let req;
  let res;
  let individualStub;
  let organisationStub;
  let saveStub;

  beforeEach(() => {
    req = {
      session: {
        deleteCraftId: 'craft-1',
        u: { dbId: 'user-1' },
        org: { i: 'organisation-1' },
        save: (callback) => callback(),
      },
    };
    res = { redirect: sinon.spy() };
    individualStub = sinon.stub(dataAccessApi.craftApi, 'deleteCraft');
    organisationStub = sinon.stub(dataAccessApi.craftApi, 'deleteOrgCraft');
    saveStub = sinon.stub(req.session, 'save').callsArg(0);
  });

  afterEach(() => sinon.restore());

  it('redirects without calling the API if no ID is set', async () => {
    delete req.session.deleteCraftId;

    await controller(req, res);

    expect(individualStub).not.to.have.been.called;
    expect(organisationStub).not.to.have.been.called;
    expect(saveStub).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/aircraft');
  });

  [
    ['individuals', 'Individual'],
    ['organisations', 'Admin'],
  ].forEach(([description, role]) => {
    describe(description, () => {
      let deleteStub;
      let unusedStub;
      let args;

      beforeEach(() => {
        req.session.u.rl = role;
        deleteStub = role === 'Individual' ? individualStub : organisationStub;
        unusedStub = role === 'Individual' ? organisationStub : individualStub;
        args = role === 'Individual' ? ['user-1', 'craft-1'] : ['organisation-1', 'user-1', 'craft-1'];
      });

      it('saves a success message and redirects after deletion', async () => {
        deleteStub.resolves({});

        await controller(req, res);

        expect(deleteStub).to.have.been.calledOnceWithExactly(...args);
        expect(unusedStub).not.to.have.been.called;
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.equal('Success');
        expect(req.session.successMsg).to.equal('Your aircraft has been deleted');
        expect(saveStub).to.have.been.calledOnce;
        expect(res.redirect).to.have.been.calledOnceWithExactly('/aircraft');
      });

      ['message response', 'http_error', 'network_error', 'timeout_error'].forEach((type) => {
        it(`saves an error and redirects without a success message on a ${type}`, async () => {
          if (type === 'message response') {
            deleteStub.resolves({ message: 'Aircraft not found' });
          } else {
            deleteStub.rejects(Object.assign(new Error('Request failed'), { type, status: 503 }));
          }

          await controller(req, res);

          expect(deleteStub).to.have.been.calledOnceWithExactly(...args);
          expect(unusedStub).not.to.have.been.called;
          expect(req.session.errMsg).to.deep.equal({ message: 'Failed to delete craft. Try again' });
          expect(req.session.successHeader).to.be.undefined;
          expect(req.session.successMsg).to.be.undefined;
          expect(saveStub).to.have.been.calledOnce;
          expect(res.redirect).to.have.been.calledOnceWithExactly('/aircraft');
        });
      });
    });
  });
});
