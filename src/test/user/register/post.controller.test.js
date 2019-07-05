/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const tokenApi = require('../../../common/services/tokenApi');
const config = require('../../../common/config');
const userCreateApi = require('../../../common/services/createUserApi');
const tokenService = require('../../../common/services/create-token');
const sendTokenService = require('../../../common/services/send-token');

const controller = require('../../../app/user/register/post.controller');

describe('User Register Post Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example request and response objects with appropriate spies
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

  });

  describe('whitelist disabled', () => {
    it('should call createUser function, and send token when all resolves', async () => {
      // sinon.stub(nanoid).returns('FakeNanoId');
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
        // TODO: Investigate
        // expect(res.redirect).to.have.been.calledWith('/user/regmsg');
      });
    });

    it('should call createUser function, but inform user if there is an issue with GOV notify', async () => {
      // sinon.stub(nanoid).returns('FakeNanoId');
      config.WHITELIST_REQUIRED = 'false';
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
        // TODO: Investigate
        // expect(res.redirect).to.have.been.calledWith('/user/regmsg');
      });
    });
  });
});
