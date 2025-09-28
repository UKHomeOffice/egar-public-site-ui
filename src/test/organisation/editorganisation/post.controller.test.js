/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import orgApi from '../../../common/services/organisationApi.js';
import controller from '../../../app/organisation/editorganisation/post.controller.js';

describe('Organisation Edit Post Controller', () => {
  let req; let res; let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        orgName: 'Evil Empire',
      },
      session: {
        org: { i: 'FIRST-ORDER-ID' },
        save: callback => callback(),
      },
    };
    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };

    orgApiStub = sinon.stub(orgApi, 'update');
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
      expect(orgApiStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/editorganisation/index', {
        cookie,
        orgName: '',
        errors: [
          new ValidationRule(validator.notEmpty, 'orgName', '', 'Enter the name of the organisation'),
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
        orgName: 'Evil Empire',
        errors: [{ message: 'orgApi.update Example Reject' }],
      });
    });
  });

  // TODO: Should there be one for the api error message...?

  it('should redirect and sets cookie value when api ok', () => {
    cookie = new CookieModel(req);

    sinon.stub(req.session, 'save').callsArg(0);
    orgApiStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(req.session.org.name).to.eq('Evil Empire');
      expect(orgApiStub).to.have.been.calledOnceWithExactly('Evil Empire', 'FIRST-ORDER-ID');
      expect(res.render).to.not.have.been.called;
      expect(req.session.save).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
    });
  });
});
