/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import i18n from 'i18n';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import craftApi from '../../../common/services/craftApi.js';
import controller from '../../../app/aircraft/edit/post.controller.js';

describe('Aircraft Edit Post Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        craftId: 'ABCDEFGH',
        registration: 'G-ABCD',
        craftType: 'Hondajet',
        craftBasePort: 'LHR',
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
    req.body.registration = '';
    req.body.craftType = '';
    req.body.craftBasePort = '';
    const cookie = new CookieModel(req);
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledWith('app/aircraft/edit/index', {
        cookie,
        errors: [
          new ValidationRule(validator.notEmpty, 'registration', '', 'Enter a registration'),
          new ValidationRule(validator.notEmpty, 'craftType', '', 'Enter an aircraft type'),
          new ValidationRule(validator.notEmpty, 'craftBasePort', '', 'Enter an aircraft home port / location'),
        ],
      });
    });
  });

  it('should return an error if message returned by API', () => {
    const cookie = new CookieModel(req);
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
    const cookie = new CookieModel(req);
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
    const cookie = new CookieModel(req);
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
    const cookie = new CookieModel(req);
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
