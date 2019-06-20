const expect = require('chai').expect;
const supertest = require('supertest');
const { describe, it } = require('mocha');
const emailService = require('../../../common/services/sendEmail');

// Local dependencies
const getApp = require('../../../server').getApp;

/**
 * N.B. NOTIFY_API_KEY needs to be set, as a NotifyClient instance is
 * created during this test.
 * 
 * TODO: Mock the NotifyClient...?
 * TODO: Branch condition is the presence of req.session, need to remove it
 */
describe('GET /healthcheck endpoint', () => {

  it('should return HTTP 200 status with expected JSON', (done) => {
    // sinon.mock(notify.NotifyClient);

    supertest(getApp())
      .get('/healthcheck')
      .set('Accept', 'application/json')
      .expect(200)
      .expect((res) => {
        const response = JSON.parse(res.text);
        expect(response.ping.healthy).to.equal(true);
      })
      .end(done);
  });
});
