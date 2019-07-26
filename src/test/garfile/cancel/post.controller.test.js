/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const garApi = require('../../../common/services/garApi');
const config = require('../../../common/config');
const emailService = require('../../../common/services/sendEmail');

const controller = require('../../../app/garfile/cancel/post.controller');

describe('GAR Cancel Post Controller', () => {
  let req; let res;
  let garApiPatchStub; let emailServiceStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        gar: {
          id: 'ABCDE-CANCEL',
        },
        u: {
          fn: 'Roberto Baggio',
          e: 'missed@italia90.fifa.com',
        },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    garApiPatchStub = sinon.stub(garApi, 'patch');
    emailServiceStub = sinon.stub(emailService, 'send');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return an error message if api rejects', () => {
    garApiPatchStub.rejects('garApi.patch Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiPatchStub).to.have.been.calledWith('ABCDE-CANCEL', 'Cancelled', {});
      expect(emailServiceStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/cancel');
    });
  });

  it('should send an email and redirect with message', () => {
    garApiPatchStub.resolves();
    emailServiceStub.resolves();

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiPatchStub).to.have.been.calledWith('ABCDE-CANCEL', 'Cancelled', {});
      expect(emailServiceStub).to.have.been.calledWith(config.NOTIFY_GAR_CANCEL_TEMPLATE_ID, 'missed@italia90.fifa.com', { firstName: 'Roberto Baggio', garId: 'ABCDE-CANCEL' });
      expect(req.session.successMsg).to.eq('The GAR has been successfully cancelled');
      expect(req.session.successHeader).to.eq('Cancellation Confirmation');
      expect(res.redirect).to.have.been.calledWith('/home');
    });
  });

  it('should redirect with error message', () => {
    garApiPatchStub.resolves();
    emailServiceStub.rejects('emailService.send Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApiPatchStub).to.have.been.calledWith('ABCDE-CANCEL', 'Cancelled', {});
      expect(emailServiceStub).to.have.been.calledWith(config.NOTIFY_GAR_CANCEL_TEMPLATE_ID, 'missed@italia90.fifa.com', { firstName: 'Roberto Baggio', garId: 'ABCDE-CANCEL' });
      expect(req.session.successMsg).to.eq('The GAR has been successfully cancelled, but there was a problem with sending the email');
      expect(req.session.successHeader).to.eq('Cancellation Confirmation');
      expect(res.redirect).to.have.been.calledWith('/home');
    });
  });
});
