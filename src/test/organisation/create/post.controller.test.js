/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const orgApi = require('../../../common/services/organisationApi');

const controller = require('../../../app/organisation/create/post.controller');

describe('Organisation Create Post Controller', () => {
  let req;
  let res;
  let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        orgName: 'New Evil Empire',
      },
      session: {
        u: { dbId: 'USER-DB-ID-1' },
        org: {},
      },
    };
    res = {
      render: sinon.stub(),
    };

    orgApiStub = sinon.stub(orgApi, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render message when name empty', () => {
    req.body.orgName = '';
    cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.org.name).to.eq('');
      expect(req.session.org.i).to.be.undefined;
      expect(req.session.u.rl).to.be.undefined;
      expect(orgApiStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly(
        'app/organisation/create/index',
        {
          cookie,
          errors: [
            new ValidationRule(
              validator.notEmpty,
              'orgName',
              '',
              'Enter the name of the organisation'
            ),
          ],
        }
      );
    });
  });

  it('should render with error message when api rejects', () => {
    cookie = new CookieModel(req);

    orgApiStub.rejects({ message: 'orgApi.update Example Reject' });

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(req.session.org.name).to.eq('New Evil Empire');
        expect(req.session.org.i).to.be.undefined;
        expect(req.session.u.rl).to.be.undefined;
        expect(orgApiStub).to.have.been.calledOnceWithExactly(
          'New Evil Empire',
          'USER-DB-ID-1'
        );
        expect(res.render).to.have.been.calledOnceWithExactly(
          'app/organisation/create/index',
          {
            cookie,
            errors: [{ message: 'orgApi.update Example Reject' }],
          }
        );
      });
  });

  it('should render with error message if api returns one', () => {
    cookie = new CookieModel(req);

    orgApiStub.resolves(
      JSON.stringify({
        message: 'User ID not found',
      })
    );

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(req.session.org.name).to.eq('New Evil Empire');
        expect(req.session.org.i).to.be.undefined;
        expect(req.session.u.rl).to.be.undefined;
        expect(orgApiStub).to.have.been.calledOnceWithExactly(
          'New Evil Empire',
          'USER-DB-ID-1'
        );
        expect(res.render).to.have.been.calledOnceWithExactly(
          'app/organisation/create/index',
          {
            cookie,
            errors: [{ message: 'User ID not found' }],
          }
        );
      });
  });

  it('should render and sets cookie value when api ok', () => {
    cookie = new CookieModel(req);

    orgApiStub.resolves(
      JSON.stringify({
        organisation: {
          organisationName: 'New Evil Empire From API',
          organisationId: 'NEW-ORG-ID-123',
        },
        role: { name: 'Admin' },
      })
    );

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(req.session.org.name).to.eq('New Evil Empire From API');
        expect(req.session.org.i).to.eq('NEW-ORG-ID-123');
        expect(req.session.u.rl).to.eq('Admin');
        expect(orgApiStub).to.have.been.calledOnceWithExactly(
          'New Evil Empire',
          'USER-DB-ID-1'
        );
        expect(res.render).to.have.been.calledOnceWithExactly(
          'app/organisation/createsuccess/index',
          {
            cookie,
          }
        );
      });
  });
});
