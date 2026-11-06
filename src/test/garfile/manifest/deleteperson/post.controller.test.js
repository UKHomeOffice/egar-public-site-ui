const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../../global.test');
const { garApi } = require('../../../../common/services/dataAccessApi');
const controller = require('../../../../app/garfile/manifest/deleteperson/post.controller');

describe('Manifest Delete Person Post Controller', () => {
  let req;
  let res;
  let remove;

  beforeEach(() => {
    req = { body: {}, session: { gar: { id: 'stale-session-id' } } };
    res = { redirect: sinon.spy(), locals: { gar: { garId: '9001' } } };
    remove = sinon.stub(garApi, 'deleteGarPeople').resolves({});
  });

  afterEach(() => sinon.restore());

  it('redirects without deleting when no person is selected', async () => {
    await controller(req, res);
    expect(remove).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('rejects a non-array, non-string selection without deleting', async () => {
    req.body.garPeopleId = 123;
    await controller(req, res);
    expect(remove).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('deletes a single selected person against the ownership-verified GAR', async () => {
    req.body.garPeopleId = 'DELETE-PERSON-ID';
    await controller(req, res);
    expect(remove).to.have.been.calledOnceWithExactly('9001', ['DELETE-PERSON-ID']);
    expect(req.session.errMsg).to.be.undefined;
    expect(req.session.successMsg).to.equal('Person removed from GAR');
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('deletes multiple selected people', async () => {
    req.body.garPeopleId = ['PERSON-1', 'PERSON-2'];
    await controller(req, res);
    expect(remove).to.have.been.calledOnceWithExactly('9001', ['PERSON-1', 'PERSON-2']);
    expect(req.session.successMsg).to.equal('Person removed from GAR');
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('sets a generic error rather than success when deletion fails', async () => {
    req.body.garPeopleId = 'PERSON-1';
    remove.rejects(new Error('Connection unavailable'));
    await controller(req, res);
    expect(req.session.errMsg).to.deep.equal({ message: 'Failed to delete GAR person. Try again' });
    expect(req.session.successMsg).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('preserves a backend HTTP error rather than setting success', async () => {
    req.body.garPeopleId = 'PERSON-1';
    remove.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'Person id not found' },
      })
    );
    await controller(req, res);
    expect(req.session.errMsg).to.deep.equal({ message: 'Person id not found' });
    expect(req.session.successMsg).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('preserves a decoded error message rather than setting success', async () => {
    req.body.garPeopleId = 'PERSON-1';
    remove.resolves({ message: 'Person id not found' });
    await controller(req, res);
    expect(req.session.errMsg).to.deep.equal({ message: 'Person id not found' });
    expect(req.session.successMsg).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });
});
