/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const config = require('../../../common/config/index');

const middleware = require('../../../common/middleware/flagpole');

describe('Flagpole Middleware', () => {
  let res; let req; let next;

  beforeEach(() => {
    chai.use(sinonChai);

    res = {
      redirect: sinon.spy(),
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect if FLAGPOLE_MAINTENANCE set', () => {
    sinon.stub(config, 'FLAGPOLE_MAINTENANCE').value('true');

    middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/error/503');
    expect(next).to.not.have.been.called;
  });

  it('should call next if FLAGPOLE_MAINTENANCE not set', () => {
    sinon.stub(config, 'FLAGPOLE_MAINTENANCE').value('false');

    middleware(req, res, next);

    expect(res.redirect).to.not.have.been.called;
    expect(next).to.have.been.called;
  });
});
