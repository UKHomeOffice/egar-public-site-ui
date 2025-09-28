/*js
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';

import '../../global.test.js';
import tokenApi from '../../../common/services/tokenApi.js';
import config from '../../../common/config/index.js';
import userCreateApi from '../../../common/services/createUserApi.js';
import tokenService from '../../../common/services/create-token.js';
import sendTokenService from '../../../common/services/send-token.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import whiteListService from '../../../common/services/whiteList.js';
import settings from '../../../common/config/index.js';

chai.use(sinonChai);

const configMock = {
  ...settings,
  ONE_LOGIN_SHOW_ONE_LOGIN: false,
};

describe('User Register Post Controller (esmock)', () => {
  let req;
  let res;
  let controller;

  beforeEach(async () => {
    req = {
      body: {
        userId: 'dvader@empire.net',
        cUserId: 'dvader@empire.net',
        userFname: 'Darth',
        userLname: 'Vader',
      },
      session: {
        gar: { id: 12345 },
        cookie: {},
        save: cb => cb(),
      },
    };

    res = {
      render: sinon.stub(),
      redirect: sinon.stub(),
    };

    sinon.stub(tokenService, 'generateHash').returns('ExampleHash12345');

    // default import of controller
    controller = await esmock('../../../app/user/register/post.controller.js');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should fail validation on erroneous submit', async () => {
    const emptyRequest = {
      body: { userFname: '', userLname: '', userId: '', cUserId: '' },
      session: { cookie: {} },
    };
    const cookie = new CookieModel(emptyRequest);

    await controller(emptyRequest, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/user/register/index', {
      cookie,
      fname: '',
      lname: '',
      usrname: '',
      errors: [
        new ValidationRule(validator.notEmpty, 'userId', '', 'Please enter your email'),
        new ValidationRule(validator.notEmpty, 'cUserId', '', 'Please confirm the email address'),
        new ValidationRule(validator.notEmpty, 'userFname', '', 'Please enter your given names'),
        new ValidationRule(validator.notEmpty, 'userLname', '', 'Please enter your surname'),
      ],
    });
  });

  it('should fail validation on invalid character at start or end of name', async () => {
    const fName = "'Mary-Lou";
    const lName = "O'Connell-";
    const email = 'mlou@email.net';

    const emptyRequest = {
      body: { userFname: fName, userLname: lName, userId: email, cUserId: email },
      session: { cookie: {} },
    };
    const cookie = new CookieModel(emptyRequest);

    await controller(emptyRequest, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/user/register/index', {
      cookie,
      fname: fName,
      lname: lName,
      usrname: email,
      errors: [
        new ValidationRule(validator.validName, 'userFname', fName, 'Please enter valid given names'),
        new ValidationRule(validator.validName, 'userLname', lName, 'Please enter a valid surname'),
      ],
    });
  });

  it('should pass validation first name or last name with hyphen or apostrophe characters', async () => {
    const fName = 'Mary-Lou';
    const lName = "O'Connell";
    const email = 'mlou@email.net';

    const request = {
      body: { userFname: fName, userLname: lName, userId: email, cUserId: email },
      session: { inv: { token: 'ABCDEF123' }, cookie: {} },
    };

    sinon.stub(sendTokenService, 'send').resolves({});
    sinon.stub(tokenApi, 'setToken');
    sinon.stub(userCreateApi, 'post').resolves(
      JSON.stringify({
        organisation: null,
        firstName: fName,
        role: { name: 'Individual', roleId: '8d06ca43-6422-4d96-a885-245e2ae59469' },
        crafts: [],
        userId: '895fbc32-2d2a-4dd5-8705-875086f6347f',
        lastName: lName,
        state: 'unverified',
        email,
      }),
    );
    sinon.stub(config, 'WHITELIST_REQUIRED').value('false');

    await controller(request, res);

    expect(userCreateApi.post).to.have.been.calledWith(fName, lName, email, request.session.inv.token);
    expect(sendTokenService.send).to.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/user/regmsg');
  });

  function stringGen(len) {
    const charset = 'abcdefghijklmnopqrstuvwxyz';
    return Array.from({ length: len }, () => charset.charAt(Math.floor(Math.random() * charset.length))).join('');
  }

  it('should fail validation on invalid first name or last name length', async () => {
    const maxFirstNameLength = config.USER_FIRST_NAME_CHARACTER_COUNT;
    const maxSurnameLength = config.USER_SURNAME_CHARACTER_COUNT;
    const fName = stringGen(maxFirstNameLength + 1);
    const lName = stringGen(maxSurnameLength + 1);
    const email = 'dvader@empire.net';

    const emptyRequest = {
      body: { userFname: fName, userLname: lName, userId: email, cUserId: email },
      session: { cookie: {} },
    };
    const cookie = new CookieModel(emptyRequest);

    await controller(emptyRequest, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/user/register/index', {
      cookie,
      fname: fName,
      lname: lName,
      usrname: email,
      errors: [
        new ValidationRule(validator.validFirstNameLength, 'userFname', fName, `Please enter given names of at most ${maxFirstNameLength} characters`),
        new ValidationRule(validator.validSurnameLength, 'userLname', lName, `Please enter a surname of at most ${maxSurnameLength} characters`),
      ],
    });
  });

  it('should fail validation on invalid first name or last name characters', async () => {
    const emptyRequest = {
      body: { userFname: 'D4rth', userLname: 'V4D3R', userId: 'dvader@empire.net', cUserId: 'dvader@empire.net' },
      session: { cookie: {} },
    };
    const cookie = new CookieModel(emptyRequest);

    await controller(emptyRequest, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/user/register/index', {
      cookie,
      fname: 'D4rth',
      lname: 'V4D3R',
      usrname: 'dvader@empire.net',
      errors: [
        new ValidationRule(validator.validName, 'userFname', 'D4rth', 'Please enter valid given names'),
        new ValidationRule(validator.validName, 'userLname', 'V4D3R', 'Please enter a valid surname'),
      ],
    });
  });

  describe('whitelist enabled', () => {
    let stubCreateUser;
    let controllerWithMock;

    beforeEach(async () => {
      stubCreateUser = sinon.stub();
      sinon.stub(config, 'WHITELIST_REQUIRED').value('true');

      controllerWithMock = await esmock('../../../app/user/register/post.controller.js', {
        '../../../app/user/register/createUser.js': { default: stubCreateUser },
      });
    });

    afterEach(() => {
      stubCreateUser.reset();
    });

    it('should create user if whitelisted', async () => {
      const cookie = new CookieModel(req);
      sinon.stub(whiteListService, 'isWhitelisted').resolves(true);

      await controllerWithMock(req, res);

      expect(whiteListService.isWhitelisted).to.have.been.calledWith('dvader@empire.net');
      expect(stubCreateUser).to.have.been.calledWith(req, res, cookie);
    });

    it('should go to success if not whitelisted', async () => {
      sinon.stub(whiteListService, 'isWhitelisted').resolves(false);
      sinon.stub(req.session, 'save').callsArg(0);

      await controllerWithMock(req, res);

      expect(whiteListService.isWhitelisted).to.have.been.calledWith('dvader@empire.net');
      expect(req.session.save).to.have.been.called;
      expect(stubCreateUser).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/user/regmsg');
    });

    it('should return an error if the whiteListService rejects', async () => {
      sinon.stub(whiteListService, 'isWhitelisted').rejects(new Error('whiteListService.isWhitelisted Example Reject'));
      const cookie = new CookieModel(req);

      await controllerWithMock(req, res);

      expect(whiteListService.isWhitelisted).to.have.been.calledWith('dvader@empire.net');
      expect(stubCreateUser).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'app/user/register/index',
        { cookie, errors: [{ message: 'Registration failed, try again' }] }
      );
    });
  });

  describe('whitelist disabled', () => {
    it('should call createUser function, and send token when all resolves', async () => {
      sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
      sinon.stub(sendTokenService, 'send').resolves();
      sinon.stub(tokenApi, 'setToken');
      sinon.stub(userCreateApi, 'post').resolves(JSON.stringify({ userId: 123456 }));

      await controller(req, res);

      expect(userCreateApi.post).to.have.been.calledWith('Darth', 'Vader', 'dvader@empire.net', sinon.match.falsy);
      expect(sendTokenService.send).to.have.been.calledWith('Darth', 'dvader@empire.net', sinon.match.string);
      expect(res.redirect).to.have.been.calledWith('/user/regmsg');
    });

    it('should call createUser function, and send token when all resolves, maintaining case', async () => {
      req.body.userId = 'CAPITAL@rAnDoM.net';
      req.body.cUserId = 'CAPITAL@rAnDoM.net';
      sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
      sinon.stub(sendTokenService, 'send').resolves();
      sinon.stub(tokenApi, 'setToken');
      sinon.stub(userCreateApi, 'post').resolves(JSON.stringify({ userId: 123456 }));

      await controller(req, res);

      expect(userCreateApi.post).to.have.been.calledWith('Darth', 'Vader', 'CAPITAL@rAnDoM.net', sinon.match.falsy);
      expect(sendTokenService.send).to.have.been.calledWith('Darth', 'CAPITAL@rAnDoM.net', sinon.match.string);
      expect(res.redirect).to.have.been.calledWith('/user/regmsg');
    });

    it('should call createUser function, but inform user if there is an issue with GOV notify', async () => {
      sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
      const cookie = new CookieModel(req);
      sinon.stub(sendTokenService, 'send').rejects('Example Reject');
      sinon.stub(tokenApi, 'setToken');
      sinon.stub(userCreateApi, 'post').resolves(JSON.stringify({ userId: 123456 }));

      await controller(req, res);

      expect(userCreateApi.post).to.have.been.calledWith('Darth', 'Vader', 'dvader@empire.net', sinon.match.falsy);
      expect(sendTokenService.send).to.have.been.calledWith('Darth', 'dvader@empire.net', sinon.match.string);
      expect(res.render).to.have.been.calledWith(
        'app/user/register/index',
        { cookie, errors: [{ message: 'Registration failed, try again' }] }
      );
    });
  });

  it('should render page if createUserApi resolves but user already exists', async () => {
    sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
    sinon.stub(req.session, 'save').callsArg(0);
    sinon.stub(sendTokenService, 'send');
    sinon.stub(tokenApi, 'setToken');
    sinon.stub(userCreateApi, 'post').resolves(JSON.stringify({ message: 'User already registered' }));

    await controller(req, res);

    expect(userCreateApi.post).to.have.been.calledWith('Darth', 'Vader', 'dvader@empire.net', sinon.match.falsy);
    expect(sendTokenService.send).to.not.have.been.called;
    expect(req.session.save).to.have.been.called;
    expect(res.render).to.have.been.calledWith(
      'app/user/register/index',
      { cookie, errors: [{ message: 'User already registered' }] }
    );
  });

  it('should redirect if createUserApi resolves but with an error', async () => {
    sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
    sinon.stub(req.session, 'save').callsArg(0);
    sinon.stub(sendTokenService, 'send');
    sinon.stub(tokenApi, 'setToken');
    sinon.stub(userCreateApi, 'post').resolves(JSON.stringify({ message: 'Unknown errors' }));

    await controller(req, res);

    expect(userCreateApi.post).to.have.been.calledWith('Darth', 'Vader', 'dvader@empire.net', sinon.match.falsy);
    expect(sendTokenService.send).to.not.have.been.called;
    expect(req.session.save).to.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/user/regmsg');
  });

  it('should return an error message when userCreateApi rejects', async () => {
    sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
    const cookie = new CookieModel(req);
    sinon.stub(sendTokenService, 'send');
    sinon.stub(tokenApi, 'setToken');
    sinon.stub(userCreateApi, 'post').rejects('userCreateApi.post Example Reject');

    await controller(req, res);

    expect(userCreateApi.post).to.have.been.calledWith('Darth', 'Vader', 'dvader@empire.net', sinon.match.falsy);
    expect(sendTokenService.send).to.not.have.been.called;
    expect(res.render).to.have.been.calledWith(
      'app/user/register/index',
      { cookie, errors: [{ message: 'Registration failed, try again' }] }
    );
  });
});
