const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const supertest = require('supertest');

require('../../global.test');
const db = require('../../../common/utils/db');
const { getApp } = require('../../../server');

const controller = require('../../../app/api/healthcheck/get.controller');

/**
 * N.B. NOTIFY_API_KEY needs to be set, as a NotifyClient instance is
 * created during this test.
 */
describe('API healthcheck get controller', () => {
  // API endpoint via supertest
  // it('should return HTTP 200 status with expected JSON', (done) => {
  //   sinon.stub(db.sequelize, 'import');
  //   sinon.stub(db.sequelize, 'query');
  //   sinon.stub(db.sequelize, 'sync').resolves();
  //   supertest(getApp())
  //     .get('/healthcheck')
  //     .set('Accept', 'application/json')
  //     .expect(200)
  //     .expect((res) => {
  //       const response = JSON.parse(res.text);
  //       expect(response.ping.healthy).to.equal(true);
  //     })
  //     .end(done);
  // });

  afterEach(() => {
    sinon.restore();
  });

  describe('controller code', () => {
    let req;
    let res;

    beforeEach(() => {
      chai.use(sinonChai);

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
