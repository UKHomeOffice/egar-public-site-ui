/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { savedPeople } from '../fixtures.js';
import '../global.test.js';
import CookieModel from '../../common/models/Cookie.class.js';
import personApi from '../../common/services/personApi.js';
import controller from '../../app/people/get.controller.js';

describe('People Get Controller', () => {
  let req; let res; let clock;
  const APRIL = 3;


  beforeEach(() => {
    chai.use(sinonChai);
    clock = sinon.useFakeTimers({
      now: new Date(2023, APRIL, 11),
      shouldAdvanceTime: false,
      toFake: ["Date"],
    });

    req = {
      session: {
        u: { dbId: 'USER-DB-ID-1' },
      },
    };
    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
    clock.restore();
  });

  it('should render with error if api rejects', () => {
    const cookie = new CookieModel(req);
    sinon.stub(personApi, 'getPeople').rejects('garApi.getPeople Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-DB-ID-1', 'individual');
      expect(res.render).to.have.been.calledWith('app/people/index', {
        cookie, errors: [{ message: 'Failed to get saved people' }],
      });
    });
  });

  it('should render the message if api returns one', () => {
    const cookie = new CookieModel(req);
    sinon.stub(personApi, 'getPeople').resolves(JSON.stringify({
      message: 'User not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-DB-ID-1', 'individual');
      expect(res.render).to.have.been.calledWith('app/people/index', {
        cookie, errors: [{ message: 'Failed to get saved people' }],
      });
    });
  });

  describe('api returns people', () => {
    const apiResponse = savedPeople();

    it('should include error messages if set in the session', () => {
      req.session.errMsg = { message: 'Example Error Message' };
      const cookie = new CookieModel(req);
      sinon.stub(personApi, 'getPeople').resolves(JSON.stringify(apiResponse));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(personApi.getPeople).to.have.been.calledWith('USER-DB-ID-1', 'individual');
        expect(res.render).to.have.been.calledWith('app/people/index', {
          cookie, people: apiResponse, errors: [{ message: 'Example Error Message' }],
        });
      });
    });

    it('should include success message if set in the session', async () => {
      req.session.successMsg = 'Example Success Message';
      req.session.successHeader = 'Successful Header';
      const cookie = new CookieModel(req);
      sinon.stub(personApi, 'getPeople').resolves(JSON.stringify(apiResponse));

      
      await controller(req, res);

      expect(req.session.successMsg).to.be.undefined;
      expect(req.session.successHeader).to.be.undefined;
      expect(personApi.getPeople).to.have.been.calledWith('USER-DB-ID-1', 'individual');
      expect(res.render).to.have.been.calledWith('app/people/index', {
        cookie, people: apiResponse, successHeader: 'Successful Header', successMsg: 'Example Success Message',
      });
    });

    it('should render the page as appropriate', async () => {
      const cookie = new CookieModel(req);
      sinon.stub(personApi, 'getPeople').resolves(JSON.stringify(apiResponse));

      await controller(req, res);

      expect(req.session.errMsg).to.be.undefined;
      expect(req.session.successMsg).to.be.undefined;
      expect(req.session.successHeader).to.be.undefined;
      expect(personApi.getPeople).to.have.been.calledWith('USER-DB-ID-1', 'individual');
      expect(res.render).to.have.been.called;
      expect(res.render).to.have.been.calledWith('app/people/index', {
        cookie, people: apiResponse,
      });
    });
  });
});
