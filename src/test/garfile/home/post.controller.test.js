/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import garoptions from '../../../common/seeddata/egar_create_gar_options.json' with { type: "json"};
import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import createGarApi from '../../../common/services/createGarApi.js';
import controller from '../../../app/garfile/home/post.controller.js';

describe('GAR Customs Post Controller', () => {
  let req; let res;
  let createGarApiStub; let sessionSaveStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      session: {
        u: { dbId: 'ExampleUser1' },
        save: callback => callback(),
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    createGarApiStub = sinon.stub(createGarApi, 'createGar');
    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
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
      expect(sessionSaveStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/home/index', {
        cookie,
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
      expect(sessionSaveStub).to.not.have.been.called;
      expect(res.render).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/garupload');
    });
  });

  it('should return an error message if api rejects', () => {
    const cookie = new CookieModel(req);
    req.body.garoption = '0';
    createGarApiStub.rejects('createGarApi.createGar Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    // TODO: Return the error message?
    callController().then().then(() => {
      expect(createGarApiStub).to.have.been.calledOnceWithExactly('ExampleUser1');
      expect(sessionSaveStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/home/index', {
        cookie, garoptions,
      });
    });
  });

  it('should return an error message if api rejects', () => {
    // Back end does not really return any other outcome, contrived example
    const cookie = new CookieModel(req);
    req.body.garoption = '0';
    createGarApiStub.resolves(JSON.stringify({
      message: 'Example contrived error message',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(createGarApiStub).to.have.been.calledOnceWithExactly('ExampleUser1');
      expect(sessionSaveStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/home/index', {
        cookie, garoptions, errors: [{ message: 'Example contrived error message' }],
      });
    });
  });

  it('should redirect to departure page on success', () => {
    const cookie = new CookieModel(req);
    req.body.garoption = '0';
    createGarApiStub.resolves(JSON.stringify({
      garId: 'NEWLY-CREATED-ID',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    // TODO: Assert that cookie now has status = Draft and garId of the returned response
    callController().then().then(() => {
      expect(createGarApiStub).to.have.been.calledOnceWithExactly('ExampleUser1');
      expect(res.render).to.not.have.been.called;
      expect(sessionSaveStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/departure');
    });
  });
});
