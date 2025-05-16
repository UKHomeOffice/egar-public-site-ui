/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const { decodeToken } = require('../../../common/utils/oneLoginAuth');
const oneLoginApi = require('../../../common/services/oneLoginApi');
const userApi = require('../../../common/services/userManageApi');
const validator = require('../../../common/utils/validator');
const {
  PHASE_GIVEN_NAME,
  PHASE_CONFIRM_NAME,
  PHASE_REGISTRATION_COMPLETE,
  WORKFLOW_STEPS
} = require('../../../app/user/onelogin/constants');

// Import controllers
const getController = require('../../../app/user/onelogin/get.controller');
const postController = require('../../../app/user/onelogin/post.controller');
const {getUserInviteToken} = require("../../../common/services/verificationApi");

describe('User OneLogin Get Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        save: sinon.spy(),
        step_data: {}
      },
      query: {},
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET Controller Tests', () => {
    it('should render the given_name step by default', async () => {
      req.cookies = {
        'state': 'valid_state',
        'nonce': 'valid_nonce',
        'id_token': 'valid_id_token',
        'access_token': 'valid_access_token'
      }
      req.headers = {
        referer: 'https://localhost:3000/'
      }


      await getController(req, res);

      expect(req.session.step).to.equal(PHASE_GIVEN_NAME);
      expect(req.session.save).to.have.been.called;
      expect(res.render).to.have.been.calledWith('app/user/onelogin/index', {
        step: `app/user/onelogin/partials/${PHASE_GIVEN_NAME}.njk`
      });
    });

    it('should redirect to 404 if step is not in workflow steps', async () => {
      req.session.step = 'invalid_step';

      req.cookies = {
        'state': 'valid_state',
        'nonce': 'valid_nonce',
        'id_token': 'valid_id_token',
        'access_token': 'valid_access_token'
      }
      req.headers = {
        referer: 'https://localhost:3000/'
      }

      await getController(req, res);

      expect(res.redirect).to.have.been.calledWith('error/404');
      expect(res.render).to.not.have.been.called;
    });

    it('should change step to given_name if action is change-name', async () => {
      req.session.step = PHASE_CONFIRM_NAME;
      req.query.action = 'change-name';
      req.cookies = {
        'state': 'valid_state',
        'nonce': 'valid_nonce',
        'id_token': 'valid_id_token',
        'access_token': 'valid_access_token'
      }
      req.headers = {
        referer: 'https://localhost:3000/'
      }

      await getController(req, res);

      expect(req.session.step).to.equal(PHASE_GIVEN_NAME);
      expect(req.session.save).to.have.been.called;
      expect(res.render).to.have.been.calledWith('app/user/onelogin/index', {
        step: `app/user/onelogin/partials/${PHASE_GIVEN_NAME}.njk`
      });
    });

    it('should render with step data if available', async () => {
      req.session.step = PHASE_CONFIRM_NAME;
      req.session.step_data = {
        firstName: 'John',
        lastName: 'Doe'
      };
      req.cookies = {
        'state': 'valid_state',
        'nonce': 'valid_nonce',
        'id_token': 'valid_id_token',
        'access_token': 'valid_access_token'
      }
      req.headers = {
        referer: 'https://localhost:3000/'
      }

      await getController(req, res);

      expect(req.session.step).to.equal(PHASE_CONFIRM_NAME);
      expect(req.session.save).to.have.been.called;
      expect(res.render).to.have.been.calledWith('app/user/onelogin/index', {
        step: `app/user/onelogin/partials/${PHASE_CONFIRM_NAME}.njk`,
        firstName: 'John',
        lastName: 'Doe'
      });
    });
  });
});

describe('User OneLogin Post Controller', () => {
  let req;
  let res;
  let validateChainsStub;
  let getUserInfoStub;
  let createUserStub;
  let getUserInviteTokenStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        save: sinon.spy(),
        step: PHASE_GIVEN_NAME,
        step_data: {}
      },
      body: {},
      cookies: {
        access_token: 'mock_access_token'
      }
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    validateChainsStub = sinon.stub(validator, 'validateChains');
    getUserInfoStub = sinon.stub(oneLoginApi, 'getUserInfoFromOneLogin');
    createUserStub = sinon.stub(userApi, 'createUser');
    getUserInviteTokenStub = sinon.stub(getUserInviteToken, 'getUserInviteToken')
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect to 404 if step is not set in session', async () => {
    getUserInviteTokenStub.resolves({tokenId: '123'})
    delete req.session.step;

    await postController(req, res);

    expect(res.redirect).to.have.been.calledWith('error/404');
    expect(res.render).to.not.have.been.called;
  });

  it('should redirect to 404 if step is not in workflow steps', async () => {
    req.session.step = 'invalid_step';

    await postController(req, res);

    expect(res.redirect).to.have.been.calledWith('error/404');
    expect(res.render).to.not.have.been.called;
  });

  describe('PHASE_GIVEN_NAME step', () => {
    beforeEach(() => {
      req.session.step = PHASE_GIVEN_NAME;
      req.body = {
        userFname: 'John',
        userLname: 'Doe'
      };
    });

    it('should validate input and proceed to next step on success', async () => {
      validateChainsStub.resolves();
      getUserInfoStub.resolves({
        email: 'john.doe@example.com',
        sub: 'onelogin_sub_id'
      });

      await postController(req, res);

      expect(validateChainsStub).to.have.been.called;
      expect(getUserInfoStub).to.have.been.calledWith('mock_access_token');
      expect(req.session.step).to.equal(PHASE_CONFIRM_NAME);
      expect(req.session.step_data).to.deep.include({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        sub: 'onelogin_sub_id'
      });
      expect(req.session.save).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/onelogin/register');
    });

    it('should render with validation errors if validation fails', async () => {
      const validationErrors = [
        { identifier: 'userFname', message: 'Please enter your given name' }
      ];
      validateChainsStub.rejects(validationErrors);

      await postController(req, res);

      expect(validateChainsStub).to.have.been.called;
      expect(req.session.step).to.equal(PHASE_GIVEN_NAME);
      expect(res.render).to.have.been.calledWith('app/user/onelogin/index', {
        step: `app/user/onelogin/partials/${PHASE_GIVEN_NAME}.njk`,
        firstName: 'John',
        lastName: 'Doe',
        errors: validationErrors
      });
    });
  });

  describe('PHASE_CONFIRM_NAME step', () => {
    beforeEach(() => {
      req.session.step = PHASE_CONFIRM_NAME;
      req.session.step_data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        sub: 'onelogin_sub_id'
      };
      req.body = {
        nameConfirmDeclaration: 'on'
      };
    });

    it('should create user and proceed to next step on success', async () => {
      createUserStub.resolves({
        userId: 'user_id',
        state: 'verified',
        role: { name: 'Individual' }
      });

      await postController(req, res);

      expect(createUserStub).to.have.been.calledWith(
        'john.doe@example.com',
        'John',
        'Doe',
        'onelogin_sub_id',
        'verified'
      );
      expect(req.session.step).to.equal(PHASE_REGISTRATION_COMPLETE);
      expect(req.session.save).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/onelogin/register');
    });

    it('should handle error if user creation fails', async () => {
      createUserStub.resolves({
        message: 'Error creating user'
      });

      req.cookies = {
        'state': 'valid_state',
        'nonce': 'valid_nonce',
        'id_token': 'valid_id_token',
        'access_token': 'valid_access_token'
      }
      req.headers = {
        referer: 'https://localhost:3000/'
      }

      await postController(req, res);

      expect(createUserStub).to.have.been.called;
      expect(req.session.step).to.equal(PHASE_CONFIRM_NAME);
      expect(res.redirect).to.have.been.calledWith('error/404');
    });

    it('should handle error if nameConfirmDeclaration is not checked', async () => {
      req.body.nameConfirmDeclaration = undefined;

      await postController(req, res);

      expect(createUserStub).to.not.have.been.called;
      expect(req.session.step).to.equal(PHASE_CONFIRM_NAME);
      expect(res.redirect).to.have.been.calledWith('/onelogin/register');
    });
  });

  describe('PHASE_REGISTRATION_COMPLETE step', () => {
    beforeEach(() => {
      req.session.step = PHASE_REGISTRATION_COMPLETE;
    });

    it('should clean up session and redirect to home', async () => {
      req.session.id_token = 'id_token';
      req.session.access_token = 'access_token';
      req.session.state = 'state';
      req.session.nonce = 'nonce';
      req.session.step_data = { data: 'value' };

      await postController(req, res);

      expect(req.session.id_token).to.be.undefined;
      expect(req.session.access_token).to.be.undefined;
      expect(req.session.state).to.be.undefined;
      expect(req.session.nonce).to.be.undefined;
      expect(req.session.step).to.be.undefined;
      expect(req.session.step_data).to.be.undefined;
      expect(res.redirect).to.have.been.calledWith('/home');
    });
  });
});
