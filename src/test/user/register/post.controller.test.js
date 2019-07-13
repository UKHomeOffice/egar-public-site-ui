/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

const tokenApi = require('../../../common/services/tokenApi');
const config = require('../../../common/config');
const userCreateApi = require('../../../common/services/createUserApi');
const tokenService = require('../../../common/services/create-token');
const sendTokenService = require('../../../common/services/send-token');
const CookieModel = require('../../../common/models/Cookie.class');
const whiteListService = require('../../../common/services/whiteList');

const controller = require('../../../app/user/register/post.controller');

describe('User Register Post Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      body: {
        userId: 'dvader@empire.net',
        cUserId: 'dvader@empire.net',
        userFname: 'Darth',
        userLname: 'Vader',
      },
      session: {
        gar: {
          id: 12345,
          voyageDeparture: {
            departureDay: 6,
            departureMonth: 6,
            departureYear: 2019,
          },
        },
        cookie: {},
        save: callback => callback(),
      },
    };

    res = {
      render: sinon.stub(),
      redirect: sinon.stub(),
    };

    sinon.stub(tokenService, 'generateHash').returns('ExampleHash12345');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should fail validation on erroneous submit', async () => {
    const emptyRequest = {
      body: {
        Username: '',
      },
      session: {
        cookie: {},
      },
    };
    try {
      await controller(emptyRequest, res);
    } catch (err) {
      expect(err).to.eq('Validation error when logging in');
      expect(res.render).to.have.been.calledWith('app/user/login/index');
    }
  });

  describe('whitelist enabled', () => {
    const rewiredController = rewire('../../../app/user/register/post.controller.js');
    const createUserFunction = { createUser: rewiredController.__get__('createUser') };
    const stubCreateUser = sinon.stub(createUserFunction, 'createUser');

    beforeEach(() => {
      config.WHITELIST_REQUIRED = 'true';
      rewiredController.__set__('createUser', stubCreateUser);
    });

    afterEach(() => {
      stubCreateUser.reset();
    });

    it('should create user if whitelisted', async () => {
      config.WHITELIST_REQUIRED = 'true';
      const cookie = new CookieModel(req);
      sinon.stub(whiteListService, 'isWhitelisted').resolves(true);

      const callController = async () => {
        await rewiredController(req, res);
      };

      callController().then(() => {
        expect(whiteListService.isWhitelisted).to.have.been.calledWith('dvader@empire.net');
        expect(stubCreateUser).to.have.been.calledWith(req, res, cookie);
      });
    });

    // TODO: If a user is not whitelisted, they still are presented with the success page
    it('should go to success if not whitelisted', async () => {
      sinon.stub(whiteListService, 'isWhitelisted').resolves(false);
      sinon.stub(req.session, 'save').callsArg(0);

      const callController = async () => {
        await rewiredController(req, res);
      };

      callController().then(() => {
        expect(whiteListService.isWhitelisted).to.have.been.calledWith('dvader@empire.net');
        expect(req.session.save).to.have.been.called;
        expect(stubCreateUser).to.not.have.been.called;
      }).then(() => {
        expect(res.redirect).to.have.been.calledWith('/user/regmsg');
      });
    });

    it('should return an error if the whiteListService rejects', () => {
      sinon.stub(whiteListService, 'isWhitelisted').rejects('whiteListService.isWhitelisted Example Reject');
      const cookie = new CookieModel(req);

      const callController = async () => {
        await rewiredController(req, res);
      };

      callController().then(() => {
        expect(whiteListService.isWhitelisted).to.have.been.calledWith('dvader@empire.net');
        expect(stubCreateUser).to.not.have.been.called;
        expect(res.render).to.not.have.been.called;
      }).then(() => {
        expect(res.render).to.have.been.calledWith('app/user/register/index', { cookie, errors: [{ message: 'Registration failed, try again' }] });
      });
    });
  });

  describe('whitelist disabled', () => {
    it('should call createUser function, and send token when all resolves', async () => {
      config.WHITELIST_REQUIRED = 'false';
      sinon.stub(sendTokenService, 'send').resolves();
      sinon.stub(tokenApi, 'setToken');
      sinon.stub(userCreateApi, 'post').resolves(
        JSON.stringify({
          userId: 123456,
        }),
      );

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(userCreateApi.post).to.have.been.calledWith('Darth', 'Vader', 'dvader@empire.net', sinon.match.falsy);
        expect(sendTokenService.send).to.have.been.calledWith('Darth', 'dvader@empire.net', sinon.match.string);
      }).then(() => {
        expect(res.redirect).to.have.been.calledWith('/user/regmsg');
      });
    });

    it('should call createUser function, but inform user if there is an issue with GOV notify', async () => {
      config.WHITELIST_REQUIRED = 'false';
      const cookie = new CookieModel(req);
      sinon.stub(sendTokenService, 'send').rejects('Example Reject');
      sinon.stub(tokenApi, 'setToken');
      sinon.stub(userCreateApi, 'post').resolves(
        JSON.stringify({
          userId: 123456,
        }),
      );

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(userCreateApi.post).to.have.been.calledWith('Darth', 'Vader', 'dvader@empire.net', sinon.match.falsy);
        expect(sendTokenService.send).to.have.been.calledWith('Darth', 'dvader@empire.net', sinon.match.string);
      }).then(() => {
        expect(res.render).to.not.been.called;
      }).then(() => {
        expect(res.render).to.have.been.calledWith('app/user/register/index', { cookie, errors: [{ message: 'Registration failed, try again' }] });
      });
    });
  });

  // TODO: Current functionality is that a message from the API could be that a user exists
  // but then goes to the next page without informing the user (so re-registering is not a thing)
  it('should redirect if createUserApi resolves but with an error', async () => {
    config.WHITELIST_REQUIRED = 'false';
    sinon.stub(req.session, 'save').callsArg(0);
    sinon.stub(sendTokenService, 'send');
    sinon.stub(tokenApi, 'setToken');
    sinon.stub(userCreateApi, 'post').resolves(
      JSON.stringify({
        message: 'User already exists',
      }),
    );

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(userCreateApi.post).to.have.been.calledWith('Darth', 'Vader', 'dvader@empire.net', sinon.match.falsy);
      expect(sendTokenService.send).to.not.have.been.called;
      expect(req.session.save).to.have.been.called;
    }).then(() => {
      expect(res.redirect).to.have.been.calledWith('/user/regmsg');
    });
  });

  it('should return an error message when userCreateApi rejects', async () => {
    config.WHITELIST_REQUIRED = 'false';
    const cookie = new CookieModel(req);
    sinon.stub(sendTokenService, 'send');
    sinon.stub(tokenApi, 'setToken');
    sinon.stub(userCreateApi, 'post').rejects('userCreateApi.post Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(userCreateApi.post).to.have.been.calledWith('Darth', 'Vader', 'dvader@empire.net', sinon.match.falsy);
      expect(sendTokenService.send).to.not.have.been.called;
      expect(res.render).to.not.have.been.called;
    }).then(() => {
      expect(res.render).to.have.been.calledWith('app/user/register/index', { cookie, errors: [{ message: 'Registration failed, try again' }] });
    });
  });
});
