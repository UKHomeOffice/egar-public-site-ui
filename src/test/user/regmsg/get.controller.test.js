const sinon = require('sinon');
const expect = require('chai').expect;
const chai = require('chai');
const sinonChai = require('sinon-chai');

const nanoid = require('nanoid/generate');
const tokenService = require('../../../common/services/create-token');
const CookieModel = require('../../../common/models/Cookie.class');
const sendTokenService = require('../../../common/services/send-token');
const tokenApi = require('../../../common/services/tokenApi');

const controller = require('../../../app/user/regmsg/get.controller');

describe('Register User Message Get Controller', () => {
  let req, res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: {
          dbId: 123,
          fn: 'Example first name',
        }
      },
      query: {
        resend: true,
      },
    };

    res = {
      render: sinon.stub(),
    };

    sinon.spy(nanoid);
    sinon.stub(tokenService, 'generateHash').callsFake((token) => {
      console.log('tokenService generateHash called with: ' + token);
      return 'ExampleHash';
    });

    sinon.stub(tokenApi, 'updateToken').callsFake((hashtoken, userDbId) => {
      console.log('tokenApi updateToken called with: ' + hashtoken);
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should not do anything if not a resend query or with no user email set', async() => {
    const blankRequest = {
      session: {},
      query: {},
    }
    let a = new CookieModel(blankRequest);
    await controller(blankRequest, res);

    expect(res.render).to.have.been.calledWith('app/user/regmsg/index');
  });

  it('should generate a hash and a token and store it when send ok', async() => {
    sinon.stub(sendTokenService, 'send').resolves();

    let a = new CookieModel(req);
    await controller(req, res);

    expect(tokenService.generateHash).to.have.been.called;
    expect(sendTokenService.send).to.have.been.called;
    expect(tokenApi.updateToken).to.have.been.calledWith('ExampleHash', 123);
    expect(res.render).to.have.been.calledWith('app/user/regmsg/index');
  });

  it('should not update token when send has an issue', async() => {
    sinon.stub(sendTokenService, 'send').rejects({message: 'Example Reject'});

    let a = new CookieModel(req);

    try {
      await controller(req, res);
    }
    catch (err) {
      expect(err.message).to.eq('Example Reject');
      expect(tokenService.generateHash).to.have.been.called;
      expect(sendTokenService.send).to.have.been.called;
      expect(tokenApi.updateToken).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/user/login/index');
    }
  });
});
