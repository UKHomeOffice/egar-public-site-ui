/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const orgApi = require('../../../common/services/organisationApi');

const controller = require('../../../app/organisation/editorganisation/post.controller');

describe('Organisation Edit Post Controller', () => {
  let req; let res; let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      body: {
        orgname: 'Evil Empire',
      },
      session: {
        org: { i: 'FIRST-ORDER-ID' },
      },
    };
    res = {
      render: sinon.stub(),
    };

    orgApiStub = sinon.stub(orgApi, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render message when name empty', () => {
    req.body.orgname = '';
    cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(orgApiStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/editorganisation/index', {
        cookie,
        errors: [
          new ValidationRule(validator.notEmpty, 'orgname', '', 'Enter the name of the organisation'),
        ],
      });
    });
  });

  it('should render with error message when api rejects', () => {
    cookie = new CookieModel(req);

    orgApiStub.rejects({ message: 'orgApi.update Example Reject' });

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(orgApiStub).to.have.been.calledOnceWithExactly('Evil Empire', 'FIRST-ORDER-ID');
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/editorganisation/index', {
        cookie,
        errors: [{ message: 'orgApi.update Example Reject' }],
      });
    });
  });

  // TODO: Should there be one for the api error message...?

  it('should render and sets cookie value when api ok', () => {
    cookie = new CookieModel(req);

    orgApiStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(req.session.org.name).to.eq('Evil Empire');
      expect(orgApiStub).to.have.been.calledOnceWithExactly('Evil Empire', 'FIRST-ORDER-ID');
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/index', {
        cookie,
      });
    });
  });
});