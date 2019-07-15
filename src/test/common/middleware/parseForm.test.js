/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

describe('Parse Form Middleware', () => {
  let res; let req; let next;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call next and invoke the bodyParser', async () => {
    const bodyParserStub = sinon.stub();
    const proxiedMiddleware = proxyquire('../../../common/middleware/parseForm', {
      'body-parser': { urlencoded: bodyParserStub },
    });

    await proxiedMiddleware(req, res, next);

    expect(bodyParserStub).to.have.been.calledOnceWithExactly({ extended: false });
    expect(next).to.have.been.called;
  });
});
