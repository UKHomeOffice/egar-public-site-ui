const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const { garApi } = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/garfile/amend/post.controller');

describe('GAR Amend Post Controller', () => {
  let req;
  let res;
  let patch;

  beforeEach(() => {
    req = {
      session: {
        gar: { id: 'session-gar' },
        save: sinon.stub().callsArg(0),
      },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      locals: { gar: { garId: 'verified-gar' } },
    };
    patch = sinon.stub(garApi, 'patch').resolves({ status: { name: 'Draft' } });
  });

  afterEach(() => sinon.restore());

  it('updates the verified GAR to draft before saving confirmation and returning to its view', async () => {
    await controller(req, res);

    expect(patch).to.have.been.calledOnceWithExactly('verified-gar', 'Draft', {});
    expect(patch).to.have.been.calledBefore(req.session.save);
    expect(req.session.successMsg).to.equal('You may now amend the GAR and resubmit it.');
    expect(req.session.successHeader).to.equal('GAR Amendment');
    expect(req.session.save).to.have.been.calledOnce;
    expect(req.session.save).to.have.been.calledBefore(res.redirect);
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/view');
  });

  it('shows an amendment error without confirmation when the update rejects', async () => {
    patch.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'Amendment rejected' },
      })
    );

    await controller(req, res);

    expect(patch).to.have.been.calledOnceWithExactly('verified-gar', 'Draft', {});
    expect(req.session.successMsg).to.be.undefined;
    expect(req.session.successHeader).to.be.undefined;
    expect(req.session.save).not.to.have.been.called;
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/amend/index', {
      cookie: new CookieModel(req),
      errors: [{ identifier: '', message: 'Failed to amend GAR. Try again' }],
    });
  });
});
