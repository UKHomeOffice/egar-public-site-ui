/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

require('../../global.test');
const tokenApi = require('../../../common/services/tokenApi');
const config = require('../../../common/config');
const userCreateApi = require('../../../common/services/createUserApi');
const tokenService = require('../../../common/services/create-token');
const sendTokenService = require('../../../common/services/send-token');
const CookieModel = require('../../../common/models/Cookie.class');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const whiteListService = require('../../../common/services/whiteList');

const settings = require('../../../common/config/index');
const configMock = {
  ...settings,
  ONE_LOGIN_SHOW_ONE_LOGIN: false,
};
const controller = require('../../../app/user/register/post.controller', {
  '../../../common/config/index': configMock,
});

describe('User Register Post Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    chai.use(sinonChai);

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
        save: (callback) => callback(),
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
        userFname: '',
        userLname: '',
        userId: '',
        cUserId: '',
      },
      session: {
        cookie: {},
      },
    };
    const cookie = new CookieModel(emptyRequest);

    callController = async () => {
      await controller(emptyRequest, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledOnceWithExactly(
        'app/user/register/index',
        {
          cookie,
          fname: '',
          lname: '',
          usrname: '',
          errors: [
            new ValidationRule(
              validator.notEmpty,
              'userId',
              '',
              'Please enter your email'
            ),
            new ValidationRule(
              validator.notEmpty,
              'cUserId',
              '',
              'Please confirm the email address'
            ),
            new ValidationRule(
              validator.notEmpty,
              'userFname',
              '',
              'Please enter your given names'
            ),
            new ValidationRule(
              validator.notEmpty,
              'userLname',
              '',
              'Please enter your surname'
            ),
          ],
        }
      );
    });
  });

  it('should fail validation on invalid character at start or end of name', async () => {
    const fName = "'Mary-Lou";
    const lName = "O'Connell-";
    const email = 'mlou@email.net';

    const emptyRequest = {
      body: {
        userFname: fName,
        userLname: lName,
        userId: email,
        cUserId: email,
      },
      session: {
        cookie: {},
      },
    };
    const cookie = new CookieModel(emptyRequest);

    callController = async () => {
      await controller(emptyRequest, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledOnceWithExactly(
        'app/user/register/index',
        {
          cookie,
          fname: fName,
          lname: lName,
          usrname: email,
          errors: [
            new ValidationRule(
              validator.validName,
              'userFname',
              fName,
              'Please enter valid given names'
            ),
            new ValidationRule(
              validator.validName,
              'userLname',
              lName,
              'Please enter a valid surname'
            ),
          ],
        }
      );
    });
  });

  it('should pass validation first name or last name with hyphen or apostrophe characters', async () => {
    const fName = 'Mary-Lou';
    const lName = "O'Connell";
    const email = 'mlou@email.net';

    const request = {
      body: {
        userFname: fName,
        userLname: lName,
        userId: email,
        cUserId: email,
      },
      session: {
        inv: { token: 'ABCDEF123' },
        cookie: {},
      },
    };

    sinon.stub(sendTokenService, 'send').resolves({});
    sinon.stub(tokenApi, 'setToken');
    sinon.stub(userCreateApi, 'post').resolves(
      JSON.stringify({
        organisation: null,
        firstName: fName,
        role: {
          name: 'Individual',
          roleId: '8d06ca43-6422-4d96-a885-245e2ae59469',
        },
        crafts: [],
        userId: '895fbc32-2d2a-4dd5-8705-875086f6347f',
        lastName: lName,
        state: 'unverified',
        email: email,
      })
    );

    sinon.stub(config, 'WHITELIST_REQUIRED').value('false');

    callController = async () => {
      await controller(request, res);
    };

    const cookie = new CookieModel(request);
    callController()
      .then(() => {
        expect(userCreateApi.post).to.have.been.calledWith(
          fName,
          lName,
          email,
          request.session.inv.token
        );
        expect(sendTokenService.send).to.have.been.called;
      })
      .then(() => {
        expect(res.redirect).to.have.been.calledWith('/user/regmsg');
      });
  });

  function stringGen(len) {
    var text = '';
    var charset = 'abcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < len; i++)
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
  }

  it('should fail validation on invalid first name or last name length', async () => {
    const maxFirstNameLength = config.USER_FIRST_NAME_CHARACTER_COUNT;
    const maxSurnameLength = config.USER_SURNAME_CHARACTER_COUNT;

    const fName = stringGen(maxFirstNameLength + 1);
    const lName = stringGen(maxSurnameLength + 1);

    const email = 'dvader@empire.net';

    const emptyRequest = {
      body: {
        userFname: fName,
        userLname: lName,
        userId: email,
        cUserId: email,
      },
      session: {
        cookie: {},
      },
    };
    const cookie = new CookieModel(emptyRequest);

    callController = async () => {
      await controller(emptyRequest, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledOnceWithExactly(
        'app/user/register/index',
        {
          cookie,
          fname: fName,
          lname: lName,
          usrname: email,
          errors: [
            new ValidationRule(
              validator.validFirstNameLength,
              'userFname',
              fName,
              `Please enter given names of at most ${maxFirstNameLength} characters`
            ),
            new ValidationRule(
              validator.validSurnameLength,
              'userLname',
              lName,
              `Please enter a surname of at most ${maxSurnameLength} characters`
            ),
          ],
        }
      );
    });
  });

  it('should fail validation on invalid first name or last name characters', async () => {
    const emptyRequest = {
      body: {
        userFname: 'D4rth',
        userLname: 'V4D3R',
        userId: 'dvader@empire.net',
        cUserId: 'dvader@empire.net',
      },
      session: {
        cookie: {},
      },
    };
    const cookie = new CookieModel(emptyRequest);

    callController = async () => {
      await controller(emptyRequest, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledOnceWithExactly(
        'app/user/register/index',
        {
          cookie,
          fname: 'D4rth',
          lname: 'V4D3R',
          usrname: 'dvader@empire.net',
          errors: [
            new ValidationRule(
              validator.validName,
              'userFname',
              'D4rth',
              'Please enter valid given names'
            ),
            new ValidationRule(
              validator.validName,
              'userLname',
              'V4D3R',
              'Please enter a valid surname'
            ),
          ],
        }
      );
    });
  });

  describe('whitelist enabled', () => {
    const rewiredController = rewire(
      '../../../app/user/register/post.controller.js'
    );
    const createUserFunction = {
      createUser: rewiredController.__get__('createUser'),
    };
    const stubCreateUser = sinon.stub(createUserFunction, 'createUser');

    beforeEach(() => {
      sinon.stub(config, 'WHITELIST_REQUIRED').value('true');
      rewiredController.__set__('createUser', stubCreateUser);
    });

    afterEach(() => {
      stubCreateUser.reset();
    });

    it('should create user if whitelisted', async () => {
      sinon.stub(config, 'WHITELIST_REQUIRED').value('true');
      const cookie = new CookieModel(req);
      sinon.stub(whiteListService, 'isWhitelisted').resolves(true);

      const callController = async () => {
        await rewiredController(req, res);
      };

      callController().then(() => {
        expect(whiteListService.isWhitelisted).to.have.been.calledWith(
          'dvader@empire.net'
        );
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

      callController()
        .then(() => {
          expect(whiteListService.isWhitelisted).to.have.been.calledWith(
            'dvader@empire.net'
          );
          expect(req.session.save).to.have.been.called;
          expect(stubCreateUser).to.not.have.been.called;
        })
        .then(() => {
          expect(res.redirect).to.have.been.calledWith('/user/regmsg');
        });
    });

    it('should return an error if the whiteListService rejects', () => {
      sinon
        .stub(whiteListService, 'isWhitelisted')
        .rejects('whiteListService.isWhitelisted Example Reject');
      const cookie = new CookieModel(req);

      const callController = async () => {
        await rewiredController(req, res);
      };

      callController()
        .then(() => {
          expect(whiteListService.isWhitelisted).to.have.been.calledWith(
            'dvader@empire.net'
          );
          expect(stubCreateUser).to.not.have.been.called;
          expect(res.render).to.not.have.been.called;
        })
        .then(() => {
          expect(res.render).to.have.been.calledWith(
            'app/user/register/index',
            { cookie, errors: [{ message: 'Registration failed, try again' }] }
          );
        });
    });
  });

  describe('whitelist disabled', () => {
    it('should call createUser function, and send token when all resolves', async () => {
      sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
      sinon.stub(sendTokenService, 'send').resolves();
      sinon.stub(tokenApi, 'setToken');
      sinon.stub(userCreateApi, 'post').resolves(
        JSON.stringify({
          userId: 123456,
        })
      );

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then(() => {
          expect(userCreateApi.post).to.have.been.calledWith(
            'Darth',
            'Vader',
            'dvader@empire.net',
            sinon.match.falsy
          );
          expect(sendTokenService.send).to.have.been.calledWith(
            'Darth',
            'dvader@empire.net',
            sinon.match.string
          );
        })
        .then(() => {
          expect(res.redirect).to.have.been.calledWith('/user/regmsg');
        });
    });

    it('should call createUser function, and send token when all resolves, maintaining case', async () => {
      req.body.userId = 'CAPITAL@rAnDoM.net';
      req.body.cUserId = 'CAPITAL@rAnDoM.net';
      sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
      sinon.stub(sendTokenService, 'send').resolves();
      sinon.stub(tokenApi, 'setToken');
      sinon.stub(userCreateApi, 'post').resolves(
        JSON.stringify({
          userId: 123456,
        })
      );

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then(() => {
          expect(userCreateApi.post).to.have.been.calledWith(
            'Darth',
            'Vader',
            'CAPITAL@rAnDoM.net',
            sinon.match.falsy
          );
          expect(sendTokenService.send).to.have.been.calledWith(
            'Darth',
            'CAPITAL@rAnDoM.net',
            sinon.match.string
          );
        })
        .then(() => {
          expect(res.redirect).to.have.been.calledWith('/user/regmsg');
        });
    });

    it('should call createUser function, but inform user if there is an issue with GOV notify', async () => {
      sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
      const cookie = new CookieModel(req);
      sinon.stub(sendTokenService, 'send').rejects('Example Reject');
      sinon.stub(tokenApi, 'setToken');
      sinon.stub(userCreateApi, 'post').resolves(
        JSON.stringify({
          userId: 123456,
        })
      );

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then(() => {
          expect(userCreateApi.post).to.have.been.calledWith(
            'Darth',
            'Vader',
            'dvader@empire.net',
            sinon.match.falsy
          );
          expect(sendTokenService.send).to.have.been.calledWith(
            'Darth',
            'dvader@empire.net',
            sinon.match.string
          );
        })
        .then(() => {
          expect(res.render).to.not.been.called;
        })
        .then(() => {
          expect(res.render).to.have.been.calledWith(
            'app/user/register/index',
            { cookie, errors: [{ message: 'Registration failed, try again' }] }
          );
        });
    });
  });

  it('should render page if createUserApi resolves but user already exists', async () => {
    sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
    sinon.stub(req.session, 'save').callsArg(0);
    sinon.stub(sendTokenService, 'send');
    sinon.stub(tokenApi, 'setToken');
    sinon.stub(userCreateApi, 'post').resolves(
      JSON.stringify({
        message: 'User already registered',
      })
    );

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then(() => {
        expect(userCreateApi.post).to.have.been.calledWith(
          'Darth',
          'Vader',
          'dvader@empire.net',
          sinon.match.falsy
        );
        expect(sendTokenService.send).to.not.have.been.called;
        expect(req.session.save).to.have.been.called;
      })
      .then(() => {
        expect(res.render).to.have.been.calledWith('app/user/register/index', {
          cookie,
          errors: [{ message: 'User already registered' }],
        });
      })
      .catch(() => {});
  });

  it('should redirect if createUserApi resolves but with an error', async () => {
    sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
    sinon.stub(req.session, 'save').callsArg(0);
    sinon.stub(sendTokenService, 'send');
    sinon.stub(tokenApi, 'setToken');
    sinon.stub(userCreateApi, 'post').resolves(
      JSON.stringify({
        message: 'Unknown errors',
      })
    );

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then(() => {
        expect(userCreateApi.post).to.have.been.calledWith(
          'Darth',
          'Vader',
          'dvader@empire.net',
          sinon.match.falsy
        );
        expect(sendTokenService.send).to.not.have.been.called;
        expect(req.session.save).to.have.been.called;
      })
      .then(() => {
        expect(res.redirect).to.have.been.calledWith('/user/regmsg');
      });
  });

  it('should return an error message when userCreateApi rejects', async () => {
    sinon.stub(config, 'WHITELIST_REQUIRED').value('false');
    const cookie = new CookieModel(req);
    sinon.stub(sendTokenService, 'send');
    sinon.stub(tokenApi, 'setToken');
    sinon
      .stub(userCreateApi, 'post')
      .rejects('userCreateApi.post Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then(() => {
        expect(userCreateApi.post).to.have.been.calledWith(
          'Darth',
          'Vader',
          'dvader@empire.net',
          sinon.match.falsy
        );
        expect(sendTokenService.send).to.not.have.been.called;
        expect(res.render).to.not.have.been.called;
      })
      .then(() => {
        expect(res.render).to.have.been.calledWith('app/user/register/index', {
          cookie,
          errors: [{ message: 'Registration failed, try again' }],
        });
      });
  });
});
