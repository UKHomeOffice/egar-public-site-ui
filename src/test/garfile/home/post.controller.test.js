/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const userattributes = require('../../../common/seeddata/egar_user_account_details.json');
const garoptions = require('../../../common/seeddata/egar_create_gar_options.json');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const createGarApi = require('../../../common/services/createGarApi.js');

const controller = require('../../../app/garfile/home/post.controller');

describe('GAR Customs Post Controller', () => {
  let req; let res;
  let createGarApiStub;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      body: {},
      session: {
        u: { dbId: 'ExampleUser1' },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    createGarApiStub = sinon.stub(createGarApi, 'createGar');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should error on validation', () => {
    const cookie = new CookieModel(req);
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(createGarApiStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/home/index', {
        cookie,
        userattributes,
        garoptions,
        errors: [
          new ValidationRule(validator.notEmpty, 'garoption', undefined, 'Select how you would like to create a GAR'),
        ],
      });
    });
  });

  it('should redirect to garupload if option is selected', () => {
    req.body.garoption = '1';

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(createGarApiStub).to.not.have.been.called;
      expect(res.render).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
    });
  });

  // shows error message if api rejects
  it('should return an error message if api rejects', () => {
    cookie = new CookieModel(req);
    req.body.garoption = '0';
    createGarApiStub.rejects('createGarApi.createGar Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    // TODO: ERROR MESSAGE
    callController().then().then(() => {
      expect(createGarApiStub).to.have.been.calledWith('ExampleUser1');
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/home/index', {
        cookie, userattributes, garoptions,
      });
    });
  });

  it('should return an error message if api rejects', () => {
    // Back end does not really return any other outcome, contriving example
    cookie = new CookieModel(req);
    req.body.garoption = '0';
    createGarApiStub.resolves(JSON.stringify({
      message: 'Example contrived error message',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(createGarApiStub).to.have.been.calledWith('ExampleUser1');
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/home/index', {
        cookie, userattributes, garoptions, errors: [{ message: 'Example contrived error message' }],
      });
    });
  });

  it('should redirect to departure page on success', () => {
    cookie = new CookieModel(req);
    req.body.garoption = '0';
    createGarApiStub.resolves(JSON.stringify({
      garId: 'NEWLY-CREATED-ID',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    // TODO: Assert that cookie now has status = Draft and garId of the returned response
    callController().then().then(() => {
      expect(createGarApiStub).to.have.been.calledWith('ExampleUser1');
      expect(res.render).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/garfile/departure');
    });
  });
});