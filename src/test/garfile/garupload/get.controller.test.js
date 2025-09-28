/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import controller from '../../../app/garfile/garupload/get.controller.js';

describe('GAR Upload Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example request and response objects with appropriate spies
    req = {
      session: {},
    };
    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page when no failure', async () => {
    const cookie = new CookieModel(req);

    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/garfile/garupload/index', { cookie });
  });

  it('should store a single object in the errors', async () => {
    req.session.failureMsg = 'Example failure message';
    req.session.failureIdentifier = 'Example identifier';
    const cookie = new CookieModel(req);

    await controller(req, res);

    expect(req.session.failureMsg).to.be.undefined;
    expect(req.session.failureIdentifier).to.be.undefined;
    expect(res.render).to.have.been.calledWith('app/garfile/garupload/index', {
      cookie,
      errors: [{ identifier: 'Example identifier', message: 'Example failure message' }],
    });
  });

  it('should store several messages if an array', async () => {
    req.session.failureMsg = [{ identifier: '1', message: 'Message 1' }, { identifier: '2', message: 'Message 2' }];
    req.session.failureIdentifier = 'Example identifier';
    const cookie = new CookieModel(req);

    await controller(req, res);

    expect(req.session.failureMsg).to.be.undefined;
    expect(req.session.failureIdentifier).to.be.undefined;
    expect(res.render).to.have.been.calledWith('app/garfile/garupload/index', {
      cookie,
      errors: [{ identifier: '1', message: 'Message 1' }, { identifier: '2', message: 'Message 2' }],
    });
  });
});
