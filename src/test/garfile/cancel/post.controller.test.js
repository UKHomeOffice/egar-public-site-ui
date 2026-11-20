const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const { garApi } = require('../../../common/services/dataAccessApi');
const config = require('../../../common/config');
const emailService = require('../../../common/services/sendEmail');
const controller = require('../../../app/garfile/cancel/post.controller');

describe('GAR Cancel Post Controller', () => {
  let req;
  let res;
  let exception;
  let patch;
  let email;

  beforeEach(() => {
    req = {
      session: {
        gar: { id: 'session-gar', cbpId: 'CBP-ID' },
        u: { fn: 'Alex', e: 'alex@example.com' },
        save: sinon.stub().callsArg(0),
      },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      locals: { gar: { garId: 'verified-gar' } },
    };
    exception = sinon.stub(garApi, 'submitGARForException').resolves({});
    patch = sinon.stub(garApi, 'patch').resolves({ status: { name: 'Cancelled' } });
    email = sinon.stub(emailService, 'send').resolves();
  });

  afterEach(() => sinon.restore());

  function expectCancellationFailure() {
    expect(email).not.to.have.been.called;
    expect(req.session.save).not.to.have.been.called;
    expect(req.session.successMsg).to.be.undefined;
    expect(req.session.successHeader).to.be.undefined;
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/cancel/index', {
      cookie: new CookieModel(req),
      errors: [{ identifier: '', message: 'Failed to cancel GAR' }],
    });
  }

  function expectConfirmation(message) {
    expect(exception).to.have.been.calledOnceWithExactly('verified-gar');
    expect(patch).to.have.been.calledOnceWithExactly('verified-gar', 'Cancelled', {});
    expect(exception).to.have.been.calledBefore(patch);
    expect(req.session.successMsg).to.equal(message);
    expect(req.session.successHeader).to.equal('Cancellation Confirmation');
    expect(req.session.save).to.have.been.calledOnce;
    expect(req.session.save).to.have.been.calledBefore(res.redirect);
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/home');
  }

  it('stops cancellation when the exception request rejects with an HTTP error', async () => {
    exception.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'GAR does not exist' },
      })
    );

    await controller(req, res);

    expect(exception).to.have.been.calledOnceWithExactly('verified-gar');
    expect(patch).not.to.have.been.called;
    expectCancellationFailure();
  });

  it('does not send confirmation when the cancellation update rejects with an HTTP error', async () => {
    patch.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'Cancellation rejected' },
      })
    );

    await controller(req, res);

    expect(patch).to.have.been.calledOnceWithExactly('verified-gar', 'Cancelled', {});
    expectCancellationFailure();
  });

  it('cancels the verified GAR before sending the confirmation email', async () => {
    await controller(req, res);

    expect(patch).to.have.been.calledBefore(email);
    expect(email).to.have.been.calledOnceWithExactly(config.NOTIFY_GAR_CANCEL_TEMPLATE_ID, 'alex@example.com', {
      firstName: 'Alex',
      cancellationReference: 'CBP-ID',
    });
    expectConfirmation('The GAR has been successfully cancelled');
  });

  it('confirms cancellation without sending an email when there is no CBP reference', async () => {
    req.session.gar.cbpId = null;

    await controller(req, res);

    expect(email).not.to.have.been.called;
    expectConfirmation('The GAR has been successfully cancelled');
  });

  it('retains the cancellation confirmation with a warning when the email fails', async () => {
    email.rejects(new Error('Notify unavailable'));

    await controller(req, res);

    expect(email).to.have.been.calledOnce;
    expectConfirmation('The GAR has been successfully cancelled, but there was a problem with sending the email');
  });
});
