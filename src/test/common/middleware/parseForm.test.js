/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import '../../global.test.js';

describe('Parse Form Middleware', () => {
  let res; let req; let next;

  beforeEach(() => {
    chai.use(sinonChai);
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call next and invoke the bodyParser', async () => {
    const bodyParserStub = sinon.stub();
    
    const proxiedMiddleware = await esmock('../../../common/middleware/parseForm.js', {
      'body-parser': { urlencoded: bodyParserStub },
    });

    await proxiedMiddleware(req, res, next);

    expect(bodyParserStub).to.have.been.calledOnceWithExactly({ extended: false });
    expect(next).to.have.been.called;
  });
});