const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const resPersonApi = require('../../../common/services/resPersonApi');

const controller = require('../../../app/resperson/delete/get.controller');

describe('Responsible Person Delete Get Controller', () => {
  let req;
  let res;
  let deleteResPersonStub;
  let sessionSaveStub;

  beforeEach(() => {
    req = {
      query: {
        deleteResponsiblePerson: 'DELETE-PERSON-ID',
      },
      session: {
        u: { dbId: '343' },
        save: (callback) => callback(),
      },
    };

    res = {
      redirect: sinon.spy(),
    };

    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
    deleteResPersonStub = sinon.stub(resPersonApi, 'deleteResponsiblePerson');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect if responsiblePersonId is undefined', async () => {
    delete req.query.deleteResponsiblePerson;

    await controller(req, res);

    expect(deleteResPersonStub).to.not.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/resperson');
  });

  it('should render the page with error if the resPerson api resolves', async () => {
    deleteResPersonStub.resolves(
      JSON.stringify({
        message: 'responsible person not found',
      })
    );

    await controller(req, res);

    expect(deleteResPersonStub).to.have.been.calledWith('343', 'DELETE-PERSON-ID');
    expect(req.session.errMsg).to.eql({
      message: 'Failed to delete responsible person. Try again',
    });
    expect(sessionSaveStub).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
  });

  it('should render the page with success message on successful deletion of responsible person', async () => {
    deleteResPersonStub.resolves(JSON.stringify({}));

    await controller(req, res);

    expect(deleteResPersonStub).to.have.been.calledWith('343', 'DELETE-PERSON-ID');
    expect(req.session.errMsg).to.be.undefined;
    expect(req.session.successHeader).to.eq('Success');
    expect(req.session.successMsg).to.eq('Responsible is person deleted');
    expect(sessionSaveStub).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
  });

  it('should render the page with error if the resPerson API rejects', async () => {
    deleteResPersonStub.rejects('getResPerson Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(deleteResPersonStub).to.have.been.calledWith('343', 'DELETE-PERSON-ID');
      expect(req.session.errMsg).to.eql({
        message: 'Failed to delete responsible person. Try again',
      });
      expect(sessionSaveStub).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
    });
  });
});
