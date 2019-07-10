/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/garfile/garupload/get.controller');

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

  // TODO:
  // req.session.failureMsg single object
  // req.session.failureMsg array of messages
});
