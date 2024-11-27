/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const config = require('../../../common/config');
const emailService = require('../../../common/services/sendEmail');

const controller = require('../../../app/garfile/cancel/post.controller');

describe('GAR Cancel Post Controller', () => {
  let req; let res; let sessionSaveStub;
  let garApiPatchStub; let emailServiceStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        gar: {
          id: 'ABCDE-CANCEL',
          cbpId: 'CBP-ID'
        },
        u: {
          fn: 'Roberto Baggio',
          e: 'missed@usa94.fifa.com',
        },
        save: callback => callback(),
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    garApiGetPeopleStub = sinon.stub(garApi, 'getPeople');
    submitGARForExceptionStub = sinon.stub(garApi, 'submitGARForException');
    garApiPatchStub = sinon.stub(garApi, 'patch');
    emailServiceStub = sinon.stub(emailService, 'send');
    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return an error message if api rejects', async () => {
    const cookie = new CookieModel(req);
    garApiPatchStub.rejects('garApi.patch Example Reject');
    garApiGetPeopleStub.resolves('{"items": []}');
    submitGARForExceptionStub.resolves();

    await controller(req, res);
   
    expect(garApiPatchStub).to.have.been.calledOnceWithExactly('ABCDE-CANCEL', 'Cancelled', {});
    expect(emailServiceStub).to.not.have.been.called;
    expect(sessionSaveStub).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/cancel', { cookie, error: [{ message: 'Failed to cancel GAR' }] });
  });

  it('should send an email and redirect with message', async () => {
    garApiPatchStub.resolves();
    emailServiceStub.resolves();
    garApiGetPeopleStub.resolves('{"items": []}');
    submitGARForExceptionStub.resolves();

    await controller(req, res);

    expect(garApiPatchStub).to.have.been.calledOnceWithExactly('ABCDE-CANCEL', 'Cancelled', {});
    expect(emailServiceStub).to.have.been.calledOnceWithExactly(config.NOTIFY_GAR_CANCEL_TEMPLATE_ID, 'missed@usa94.fifa.com', { firstName: 'Roberto Baggio', cancellationReference:  'CBP-ID' });
    expect(req.session.successMsg).to.eq('The GAR has been successfully cancelled');
    expect(req.session.successHeader).to.eq('Cancellation Confirmation');
    expect(sessionSaveStub).to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/home');
  });

  it('should redirect with error message', async () => {
    garApiPatchStub.resolves();
    emailServiceStub.rejects('emailService.send Example Reject');
    garApiGetPeopleStub.resolves('{"items": []}');
    submitGARForExceptionStub.resolves();

    await controller(req, res);

    expect(garApiPatchStub).to.have.been.calledOnceWithExactly('ABCDE-CANCEL', 'Cancelled', {});
    expect(emailServiceStub).to.have.been.calledOnceWithExactly(config.NOTIFY_GAR_CANCEL_TEMPLATE_ID, 'missed@usa94.fifa.com', { firstName: 'Roberto Baggio', cancellationReference:  'CBP-ID' });
    expect(req.session.successMsg).to.eq('The GAR has been successfully cancelled, but there was a problem with sending the email');
    expect(req.session.successHeader).to.eq('Cancellation Confirmation');
    expect(sessionSaveStub).to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/home');
  });
});
