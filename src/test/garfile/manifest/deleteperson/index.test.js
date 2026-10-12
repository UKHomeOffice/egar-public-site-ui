const express = require('express');
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

require('../../../global.test');

describe('garfile/manifest/deleteperson route', () => {
  let server, baseUrl, hasGarOwnership, postController, clearGar;

  beforeEach(async () => {
    chai.use(sinonChai);
    hasGarOwnership = sinon.stub();
    postController = sinon.spy((req, res) => res.status(200).send('deleted'));
    clearGar = sinon.spy();

    class CookieStub {
      getGarId() {
        return 'gar-1';
      }
      setGarId() {}
      clearGar() {
        clearGar();
      }
      getUserDbId() {
        return 'user-1';
      }
    }

    const passThrough = (req, res, next) => next();
    const garAccessCheck = proxyquire('../../../../common/middleware/garOwnership', {
      '../models/Cookie.class': CookieStub,
      '../../common/utils/garOwnership': { hasGarOwnership },
    });
    const nav = proxyquire('../../../../common/utils/nav', {
      '../../common/middleware/flagpole': passThrough,
      '../../common/middleware/usercheck': passThrough,
      '../../common/middleware/csrfcheck': passThrough,
      '../../common/middleware/parseForm': passThrough,
      '../middleware/pageAccess': passThrough,
      '../middleware/garOwnership': garAccessCheck,
    });
    const deletePerson = proxyquire('../../../../app/garfile/manifest/deleteperson/index', {
      '../../../../common/utils/nav': nav,
      './post.controller': postController,
    });

    const app = express();
    app.use(deletePerson.router);
    await new Promise((resolve) => {
      server = app.listen(0, resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}${deletePerson.paths.index}`;
  });

  afterEach(() => new Promise((resolve) => server.close(resolve)));

  it('should not delete people from a GAR the user does not own', async () => {
    hasGarOwnership.resolves({ ok: false, gar: { garId: 'gar-1', userId: 'other-user' } });

    const response = await fetch(baseUrl, { method: 'POST', redirect: 'manual' });

    expect(response.status).to.eq(302);
    expect(response.headers.get('location')).to.eq('/home');
    expect(postController).to.not.have.been.called;
    expect(clearGar).to.have.been.calledOnce;
  });

  it('should delete people from a GAR the user owns', async () => {
    hasGarOwnership.resolves({ ok: true, gar: { garId: 'gar-1', userId: 'user-1' } });

    const response = await fetch(baseUrl, { method: 'POST', redirect: 'manual' });

    expect(response.status).to.eq(200);
    expect(postController).to.have.been.calledOnce;
  });
});
