/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import '../../global.test.js';
import config from '../../../common/config/index.js';

describe('Send Token Service', () => {
  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should throw error if no API key', async () => {
    sinon.stub(config, 'NOTIFY_API_KEY').value(null);

    try {
      // Try to import the service which should throw during module initialization
      await import('../../../common/services/send-token.js');
    } catch (err) {
      expect(err.message).to.eq('Mandatory environment variable for GOV.UK Notify not set');
    }
  });

  it('should send', async () => {
    sinon.stub(config, 'NOTIFY_TOKEN_TEMPLATE_ID').value('EXAMPLE_TEMPLATE_ID');
    sinon.stub(config, 'BASE_URL').value('somewhereovertherainbow.com');
    
    const notifyStub = {
      sendEmail: sinon.stub().resolves('Success'),
    };

    const sendTokenService = await esmock('../../../common/services/send-token.js', {}, {
      'notifications-node-client': {
        NotifyClient: function() {
          return notifyStub;
        }
      }
    });

    await sendTokenService.send('Colin', 'colin.chapman@lotus.com', 'ABCDE12345');

    expect(notifyStub.sendEmail).to.have.been.calledOnceWithExactly('EXAMPLE_TEMPLATE_ID',
      'colin.chapman@lotus.com', {
        personalisation: {
          first_name: 'Colin',
          token: 'ABCDE12345',
          base_url: 'somewhereovertherainbow.com',
        },
      });
  });

  it('should fail send', async () => {
    sinon.stub(config, 'NOTIFY_TOKEN_TEMPLATE_ID').value('EXAMPLE_TEMPLATE_ID_2');
    sinon.stub(config, 'BASE_URL').value('randomsite.com');

    const notifyStub = {
      sendEmail: sinon.stub().rejects(new Error('Example Reject')),
    };

    const sendTokenService = await esmock('../../../common/services/send-token.js', {}, {
      'notifications-node-client': {
        NotifyClient: function() {
          return notifyStub;
        }
      }
    });

    try {
      await sendTokenService.send('Jeff', 'jeff@somewhere.com', 'ABC123');
      chai.assert.fail('Should not reach here');
    } catch (err) {
      expect(notifyStub.sendEmail).to.have.been.calledOnceWithExactly('EXAMPLE_TEMPLATE_ID_2',
        'jeff@somewhere.com', {
          personalisation: {
            first_name: 'Jeff',
            token: 'ABC123',
            base_url: 'randomsite.com',
          },
        });
      expect(err.message).to.eq('Example Reject');
    }
  });
});