/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import config from '../../../common/config/index.js';
import middleware from '../../../common/middleware/flagpole.js';

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
