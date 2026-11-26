/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

require('../../global.test');
const notify = require('notifications-node-client');
const config = require('../../../common/config/index');

const emailService = require('../../../common/services/sendEmail');

describe('Send Email Service', () => {
  let notifyStub;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    chai.use(sinonChai);

    notifyStub = sinon.stub(notify.NotifyClient.prototype, 'sendEmail');
  });

  afterEach(() => {
    sinon.restore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  // For the sake of code coverage, have this rewire the logger for production...
  it('should throw an error if no API key set', () => {
    process.env.NODE_ENV = 'production';
    sinon.stub(config, 'NOTIFY_API_KEY').value(null);
    try {
      rewire('../../../common/utils/logger')(__filename);
      sendTokenService = rewire('../../../common/services/sendEmail');
    } catch (err) {
      expect(err.message).to.eq('Mandatory environment variable for GOV.UK Notify not set');
      expect(notifyStub).to.not.have.been.called;
    }
  });

  it('should reject on API reject', () => {
    notifyStub.rejects(new Error('Example Error from API'));

    emailService
      .send('template_id', 'a@b.com', { firstName: 'a' })
      .then(() => {
        chai.assert.fail('Should not reach here');
      })
      .catch((err) => {
        expect(notifyStub).to.have.been.calledOnceWithExactly('template_id', 'a@b.com', {
          personalisation: { firstName: 'a' },
        });
        expect(err.message).to.eq('Example Error from API');
      });
  });

  it('should resolve on API resolve', () => {
    notifyStub.resolves('Success');

    emailService
      .send('template_id_2', 'b@c.com', { firstName: 'b' })
      .then((result) => {
        expect(notifyStub).to.have.been.calledOnceWithExactly('template_id_2', 'b@c.com', {
          personalisation: { firstName: 'b' },
        });
        expect(result).to.eq('Success');
      })
      .catch(() => {
        chai.assert.fail('Should not reach here');
      });
  });

  it('logs safe Notify rejection reasons without exposing response data', async () => {
    const logError = sinon.spy();
    const service = rewire('../../../common/services/sendEmail');
    service.__set__('logger', { error: logError });

    const failure = new Error('Request failed for person@example.com with secret-value');
    failure.response = {
      status: 400,
      data: {
        errors: [
          { error: 'BadRequestError', message: "Can't send to this recipient using a team-only API key" },
          {
            error: 'BadRequestError',
            message: "Can't send to this recipient when service is in trial mode - see https://example.com",
          },
          { error: 'BadRequestError', message: 'Missing personalisation: person@example.com' },
        ],
        email: 'person@example.com',
        token: 'secret-value',
      },
    };
    notifyStub.rejects(failure);

    try {
      await service.send('template_id', 'person@example.com', { user: 'Person' });
      expect.fail('Expected the Notify request to fail');
    } catch (error) {
      expect(error).to.equal(failure);
    }

    expect(logError).to.have.been.calledOnce;
    expect(logError.firstCall.args[1]).to.include({
      statusCode: 400,
    });
    expect(logError.firstCall.args[1].notifyErrorReasons).to.deep.equal([
      'recipient_not_allowed_team_key',
      'recipient_not_allowed_trial_mode',
      'missing_personalisation',
    ]);
    expect(JSON.stringify(logError.firstCall.args)).not.to.include('person@example.com');
    expect(JSON.stringify(logError.firstCall.args)).not.to.include('secret-value');
  });

  it('handles unknown Notify errors without logging raw details', async () => {
    const logError = sinon.spy();
    const service = rewire('../../../common/services/sendEmail');
    service.__set__('logger', { error: logError });
    const failure = new Error('person@example.com secret-value');
    failure.response = {
      status: 400,
      data: { errors: [{ error: 'Unexpected person@example.com', message: 'secret-value' }] },
    };
    notifyStub.rejects(failure);

    try {
      await service.send('template_id', 'person@example.com', {});
      expect.fail('Expected the Notify request to fail');
    } catch (error) {
      expect(error).to.equal(failure);
    }

    expect(logError.firstCall.args[1].notifyErrorReasons).to.deep.equal(['unknown_notify_error']);
    expect(JSON.stringify(logError.firstCall.args)).not.to.include('person@example.com');
    expect(JSON.stringify(logError.firstCall.args)).not.to.include('secret-value');
  });

  it('logs a safe network error code when Notify gives no response', async () => {
    const logError = sinon.spy();
    const service = rewire('../../../common/services/sendEmail');
    service.__set__('logger', { error: logError });
    const failure = new Error('person@example.com secret-value');
    failure.code = 'ETIMEDOUT';
    notifyStub.rejects(failure);

    try {
      await service.send('template_id', 'person@example.com', {});
      expect.fail('Expected the Notify request to fail');
    } catch (error) {
      expect(error).to.equal(failure);
    }

    expect(logError.firstCall.args[1]).to.include({ errorCode: 'ETIMEDOUT' });
    expect(logError.firstCall.args[1].notifyErrorReasons).to.deep.equal([]);
    expect(JSON.stringify(logError.firstCall.args)).not.to.include('person@example.com');
    expect(JSON.stringify(logError.firstCall.args)).not.to.include('secret-value');
  });
});
