/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

require('../../global.test');

const config = require('../../../common/config/index');

describe('Send Token Service', () => {
  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should throw error if no API key', () => {
    sinon.stub(config, 'NOTIFY_API_KEY').value(null);

    try {
      sendTokenService = rewire('../../../common/services/send-token');
    } catch (err) {
      expect(err.message).to.eq('Mandatory environment variable for GOV.UK Notify not set');
    }
  });

  it('should send', () => {
    sinon.stub(config, 'NOTIFY_TOKEN_TEMPLATE_ID').value('EXAMPLE_TEMPLATE_ID');
    sinon.stub(config, 'BASE_URL').value('somewhereovertherainbow.com');
    const notifyStub = {
      sendEmail: sinon.stub().resolves('Success'),
    };

    sendTokenService = rewire('../../../common/services/send-token');
    sendTokenService.__set__({
      notifyClient: notifyStub,
    });

    const callController = async () => {
      await sendTokenService.send('Colin', 'colin.chapman@lotus.com', 'ABCDE12345');
    };

    callController().then(() => {
      // Response appears to be undefined.
      expect(notifyStub.sendEmail).to.have.been.calledOnceWithExactly(
        'EXAMPLE_TEMPLATE_ID',
        'colin.chapman@lotus.com',
        {
          personalisation: {
            first_name: 'Colin',
            token: 'ABCDE12345',
            base_url: 'somewhereovertherainbow.com',
          },
        }
      );
    });
  });

  it('should fail send', async () => {
    sinon.stub(config, 'NOTIFY_TOKEN_TEMPLATE_ID').value('EXAMPLE_TEMPLATE_ID_2');
    sinon.stub(config, 'BASE_URL').value('randomsite.com');

    const notifyStub = {
      sendEmail: sinon.stub().rejects('Example Reject'),
    };
    sendTokenService = rewire('../../../common/services/send-token');
    sendTokenService.__set__({
      notifyClient: notifyStub,
    });

    const callController = async () => {
      await sendTokenService.send('Jeff', 'jeff@somewhere.com', 'ABC123');
    };

    callController()
      .then(() => {
        chai.assert.fail('Should not reach here');
      })
      .catch((err) => {
        expect(notifyStub.sendEmail).to.have.been.calledOnceWithExactly('EXAMPLE_TEMPLATE_ID_2', 'jeff@somewhere.com', {
          personalisation: {
            first_name: 'Jeff',
            token: 'ABC123',
            base_url: 'randomsite.com',
          },
        });
        expect(err.name).to.eq('Example Reject');
      });
  });
});
