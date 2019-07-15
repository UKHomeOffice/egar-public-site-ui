/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const supertest = require('supertest');

const { getApp } = require('../../../server');

const controller = require('../../../app/api/healthcheck/get.controller');

/**
 * N.B. NOTIFY_API_KEY needs to be set, as a NotifyClient instance is
 * created during this test.
 */
describe('API healthcheck get controller', () => {
  // API endpoint via supertest
  it('should return HTTP 200 status with expected JSON', (done) => {
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

  describe('controller code', () => {
    let req; let res;

    beforeEach(() => {
      chai.use(sinonChai);
      process.on('unhandledRejection', (error) => {
        chai.assert.fail(`Unhandled rejection encountered: ${error}`);
      });

      req = {
        body: {
          departureDate: null,
          departurePort: 'ZZZZ',
        },
        session: {
          u: { dbId: 'U-DBID-1', e: 'example@somewhere.com' },
        },
      };

      res = {
        setHeader: sinon.spy(),
        json: sinon.spy(),
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should populate the cookie if session exists', async () => {
      await controller(req, res);

      expect(res.setHeader).to.have.been.calledOnceWithExactly('Content-Type', 'application/json');
      expect(res.json).to.have.been.called.calledOnceWithExactly({
        ping: { healthy: true },
        cookie: { u: { dbId: 'U-DBID-1', e: 'example@somewhere.com' } },
      });
    });

    it('should just contain ping status if no session', async () => {
      delete req.session;

      await controller(req, res);

      expect(res.setHeader).to.have.been.calledOnceWithExactly('Content-Type', 'application/json');
      expect(res.json).to.have.been.called.calledOnceWithExactly({
        ping: { healthy: true },
      });
    });
  });
});
