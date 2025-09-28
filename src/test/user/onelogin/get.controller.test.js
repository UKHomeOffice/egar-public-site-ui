/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';

import {
  PHASE_GIVEN_NAME,
  PHASE_CONFIRM_NAME,
} from '../../../app/user/onelogin/constants.js';

import getController from '../../../app/user/onelogin/get.controller.js';

describe.skip('User OneLogin Get Controller', () => {
  describe('GET Controller Tests', () => {
     let req;
      let res;

      beforeEach(() => {
        chai.use(sinonChai);

        req = {
          session: {
            save: sinon.spy(),
            step_data: {},
            step: null,
          },
          query: {},
        };

        res = {
          redirect: sinon.spy(),
          render: sinon.spy(),
        };
      });

      afterEach(() => {
        sinon.restore();
      });

    it('should render the given_name step by default', async () => {
      req.session.step = null;
      req.cookies = {
        'state': 'valid_state',
        'nonce': 'valid_nonce',
        'id_token': 'valid_id_token',
      }
      req.session.access_token = 'valid_access_token';
      req.headers = {
        referer: 'https://localhost:3000/'
      }


      await getController(req, res);

      expect(req.session.step).to.equal(PHASE_GIVEN_NAME);
      expect(res.render).to.have.been.calledWith('app/user/onelogin/index', {
        step: `app/user/onelogin/partials/${PHASE_GIVEN_NAME}.njk`
      });
    });

    it('should change step to given_name if action is change-name', async () => {
      req.session.step = PHASE_CONFIRM_NAME;
      req.query.action = 'change-name';
      req.cookies = {
        'state': 'valid_state',
        'nonce': 'valid_nonce',
        'id_token': 'valid_id_token',
        'access_token': 'valid_access_token'
      }
      req.headers = {
        referer: 'https://localhost:3000/'
      }

      await getController(req, res);

      expect(req.session.step).to.equal(PHASE_GIVEN_NAME);
      expect(req.session.save).to.have.been.called;
      expect(res.render).to.have.been.calledWith('app/user/onelogin/index', {
        step: `app/user/onelogin/partials/${PHASE_GIVEN_NAME}.njk`
      });
    });

    it('should render with step data if available', async () => {
      req.session.step = PHASE_CONFIRM_NAME;
      req.session.step_data = {
        firstName: 'John',
        lastName: 'Doe'
      };
      req.cookies = {
        'state': 'valid_state',
        'nonce': 'valid_nonce',
        'id_token': 'valid_id_token',
        'access_token': 'valid_access_token'
      }
      req.headers = {
        referer: 'https://localhost:3000/'
      }

      await getController(req, res);

      expect(req.session.step).to.equal(PHASE_CONFIRM_NAME);
      expect(req.session.save).to.have.been.called;
      expect(res.render).to.have.been.calledWith('app/user/onelogin/index', {
        step: `app/user/onelogin/partials/${PHASE_CONFIRM_NAME}.njk`,
        firstName: 'John',
        lastName: 'Doe'
      });
    });
  });
});
