/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const craftApi = require('../../../common/services/craftApi');

const controller = require('../../../app/aircraft/edit/post.controller');

describe('Aircraft Edit Post Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        craftId: 'ABCDEFGH',
        craftReg: 'G-ABCD',
        craftType: 'Hondajet',
        craftBase: 'lhr',
      },
      session: {},
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return error messages if validation errors', () => {
    req.body.craftReg = '';
    req.body.craftType = '';
    req.body.craftBase = '';
    const cookie = new CookieModel(req);
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledWith('app/aircraft/edit/index', {
        cookie,
        errors: [
          new ValidationRule(validator.notEmpty, 'craftReg', '', 'Enter the registration deatils of the craft'),
          new ValidationRule(validator.notEmpty, 'craftType', '', 'Enter the craft type'),
          new ValidationRule(validator.notEmpty, 'craftBase', '', 'Enter the base of the craft'),
        ],
      });
    });
  });

  // craftApi rejects (TODO)
  it('should return an error if message returned by API', () => {
    cookie = new CookieModel(req);
    sinon.stub(craftApi, 'update').rejects('craftApi.update Example Reject');
    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(craftApi.update).to.have.been.calledWith('G-ABCD', 'Hondajet', 'LHR');
      expect(res.render).to.have.been.calledWith('app/aircraft/edit/index', {
        cookie,
        errors: [{ message: 'An error has occurred. Try again later' }],
      });
    });
  });

  it('should return an error if message returned by API', () => {
    cookie = new CookieModel(req);
    sinon.stub(craftApi, 'update').resolves(JSON.stringify({
      message: 'Aircraft not found',
    }));
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(craftApi.update).to.have.been.calledWith('G-ABCD', 'Hondajet', 'LHR');
      expect(res.render).to.have.been.calledWith('app/aircraft/edit/index', {
        cookie,
        errors: [{ message: 'Aircraft not found' }],
      });
    });
  });

  // Back end needs indices corrected and this should then be obselete
  it('should return an error if message returned by API is not JSON', () => {
    cookie = new CookieModel(req);
    sinon.stub(craftApi, 'update').resolves('<html><head></head><body></body></html>');
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(craftApi.update).to.have.been.calledWith('G-ABCD', 'Hondajet', 'LHR');
      expect(res.render).to.have.been.calledWith('app/aircraft/edit/index', {
        cookie,
        errors: [{ message: 'There was a problem saving the aircraft. Try again later' }],
      });
    });
  });

  // Back end needs indices corrected and this should then be obselete
  it('should return an error if message returned by API is not JSON containing possible duplicate error', () => {
    cookie = new CookieModel(req);
    sinon.stub(craftApi, 'update').resolves('DETAIL:  Key (registration)');
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(craftApi.update).to.have.been.calledWith('G-ABCD', 'Hondajet', 'LHR');
      expect(res.render).to.have.been.calledWith('app/aircraft/edit/index', {
        cookie,
        errors: [{ message: 'Craft already exists' }],
      });
    });
  });

  it('should redirect if successful', () => {
    sinon.stub(craftApi, 'update').resolves(JSON.stringify({}));
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(craftApi.update).to.have.been.calledWith('G-ABCD', 'Hondajet', 'LHR');
      expect(res.redirect).to.have.been.calledWith('/aircraft');
    });
  });
});
