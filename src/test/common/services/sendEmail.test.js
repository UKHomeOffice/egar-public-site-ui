/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import rewire from 'rewire';
import '../../global.test.js';
import notify from 'notifications-node-client';
import config from '../../../common/config/index.js';
import service from '../../../common/services/sendEmail.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

describe('Send Email Service', () => {
  let notifyStub;

  beforeEach(() => {
    chai.use(sinonChai);

    notifyStub = sinon.stub(notify.NotifyClient.prototype, 'sendEmail');
  });

  afterEach(() => {
    sinon.restore();
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

    service.send('template_id', 'a@b.com', { firstName: 'a' }).then(() => {
      chai.assert.fail('Should not reach here');
    }).catch((err) => {
      expect(notifyStub).to.have.been.calledOnceWithExactly('template_id', 'a@b.com', { personalisation: { firstName: 'a' } });
      expect(err.message).to.eq('Example Error from API');
    });
  });

  it('should resolve on API resolve', () => {
    notifyStub.resolves('Success');

    service.send('template_id_2', 'b@c.com', { firstName: 'b' }).then((result) => {
      expect(notifyStub).to.have.been.calledOnceWithExactly('template_id_2', 'b@c.com', { personalisation: { firstName: 'b' } });
      expect(result).to.eq('Success');
    }).catch(() => {
      chai.assert.fail('Should not reach here');
    });
  });
});
