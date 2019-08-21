/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const i18n = require('i18n');
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

    sinon.stub(i18n, '__').callsFake((key) => {
      switch (key) {
        case 'validation_aircraft_registration':
          return 'Enter a registration';
        case 'validation_aircraft_type':
          return 'Enter an aircraft type';
        case 'validation_aircraft_base':
          return 'Enter an aircraft home port / location';
        default:
          return 'Unexpected Key';
      }
    });
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
          new ValidationRule(validator.notEmpty, 'craftReg', '', 'Enter a registration'),
          new ValidationRule(validator.notEmpty, 'craftType', '', 'Enter an aircraft type'),
          new ValidationRule(validator.notEmpty, 'craftBase', '', 'Enter an aircraft home port / location'),
        ],
      });
    });
  });

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
