const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const canonicaliseInput = require('../../../common/middleware/canonicaliseInput');

describe('Canonicalise Input Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    chai.use(sinonChai);
    res = {};
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should trim whitespace from string values', () => {
    req = { body: { name: '  John Smith  ' } };

    canonicaliseInput(req, res, next);

    expect(req.body.name).to.equal('John Smith');
    expect(next).to.have.been.calledOnce;
  });
  it('should normalise unicode strings to NFC form', () => {
    const input = 'e\u0301van';
    req = { body: { input: input } };

    canonicaliseInput(req, res, next);

    expect(req.body.input).to.equal(input.normalize('NFC'));
    expect(req.body.input).to.equal('évan');
    expect(next).to.have.been.calledOnce;
  });

  it('should recursively canonicalise nested objects', () => {
    req = { body: { user: { first: '  Jane  ', last: '  Smith  ' } } };

    canonicaliseInput(req, res, next);

    expect(req.body.user.first).to.equal('Jane');
    expect(req.body.user.last).to.equal('Smith');
    expect(next).to.have.been.calledOnce;
  });

  it('should recursively canonicalise arrays of strings', () => {
    req = { body: { tags: ['  one ', ' two  '] } };

    canonicaliseInput(req, res, next);

    expect(req.body.tags).to.deep.equal(['one', 'two']);
    expect(next).to.have.been.calledOnce;
  });

  it('should leave non-string values untouched', () => {
    req = { body: { deletePerson: true, missing: null } };

    canonicaliseInput(req, res, next);

    expect(req.body.deletePerson).to.equal(true);
    expect(req.body.missing).to.equal(null);
    expect(next).to.have.been.calledOnce;
  });

  it('should handle an undefined body without throwing', () => {
    req = {};

    expect(() => canonicaliseInput(req, res, next)).to.not.throw();
    expect(req.body).to.equal(undefined);
    expect(next).to.have.been.calledOnce;
  });

  it('should call next exactly once', () => {
    req = { body: {} };

    canonicaliseInput(req, res, next);
    expect(next).to.have.been.calledOnce;
  });
});
