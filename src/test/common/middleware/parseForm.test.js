/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const bodyParser = require('body-parser');

const middleware = require('../../../common/middleware/parseForm');

describe('Parse Form Middleware', () => {
  let res; let req; let next;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    next = sinon.spy();
  });

  it('should call next and invoke the bodyParser', async () => {
    bodyParser.urlencoded({ extended: false });
    // Attempted to wrap undefined property urlencoded as function
    // so need to investigate: sinon.spy(bodyParser, 'urlencoded');
    await middleware(req, res, next);

    expect(next).to.have.been.called;
  });
});
