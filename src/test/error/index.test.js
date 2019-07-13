const { expect } = require('chai');
const supertest = require('supertest');
const { describe, it } = require('mocha');

const { getApp } = require('../../server');

describe('Error Routes', () => {
  it('should render 404', (done) => {
    supertest(getApp())
      .get('/error/404')
      .set('Accept', 'application/json')
      .expect(404)
      .expect((res) => {
        expect(res.status).to.eq(404);
        expect(res.text).to.contain('Sorry, something went wrong.');
      })
      .end(done);
  });

  it('should render 401', (done) => {
    supertest(getApp())
      .get('/error/401')
      .set('Accept', 'application/json')
      .expect(401)
      .expect((res) => {
        expect(res.status).to.eq(401);
        expect(res.text).to.contain('Sorry, your link has expired');
      })
      .end(done);
  });

  it('should render 500', (done) => {
    supertest(getApp())
      .get('/error/500')
      .set('Accept', 'application/json')
      .expect(500)
      .expect((res) => {
        expect(res.status).to.eq(500);
        expect(res.text).to.contain('Sorry, there was a problem');
      })
      .end(done);
  });

  it('should render 503', (done) => {
    supertest(getApp())
      .get('/error/503')
      .set('Accept', 'application/json')
      .expect(503)
      .expect((res) => {
        expect(res.status).to.eq(503);
        expect(res.text).to.contain('Sorry, the service is currently unavailable');
      })
      .end(done);
  });
});
