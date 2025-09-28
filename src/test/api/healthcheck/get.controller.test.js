/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import controller from '../../../app/api/healthcheck/get.controller.js';

/**
 * N.B. NOTIFY_API_KEY needs to be set, as a NotifyClient instance is
 * created during this test.
 */
describe('API healthcheck get controller', () => {

  afterEach(() => {
    sinon.restore();
  });

  describe('controller code', () => {
    let req; let res;

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
