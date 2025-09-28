/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import i18n from 'i18n';
import '../../global.test.js';
import craftApi from '../../../common/services/craftApi.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import controller from '../../../app/aircraft/add/post.controller.js';
import paginate from '../../../common/utils/pagination.js';

describe('Aircraft Add Post Controller', () => {
  let req; let res; let craftApiStub; let sessionSaveStub;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example response object with appropriate spies
    req = {
      body: {
        registration: 'G-ABCD',
        craftType: 'Gulfstream',
        craftBasePort: 'LHR',
      },
      session: {
        cookie: {},
        save: callback => callback(),
      },
    };
    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };
    craftApiStub = sinon.stub(craftApi, 'create');
    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
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

  describe('validation chains', () => {
    it('should return message when registration is empty', () => {
      req.body.registration = '';
      const rule = new ValidationRule(validator.notEmpty, 'registration', '', 'Enter a registration');
      const cookie = new CookieModel(req);
      const craftObj = {
        registration: '', 
        craftType: 'Gulfstream', 
        craftBasePort: 'LHR', 
        craftBaseLat: null, 
        craftBaseLong: null,
        portChoice: 'Yes'
      };
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', {
          cookie, craftObj, errors: [rule],
        });
      });
    });

    it('should return message when type is empty', () => {
      req.body.craftType = '';
      const rule = new ValidationRule(validator.notEmpty, 'craftType', '', 'Enter an aircraft type');
      const cookie = new CookieModel(req);
      const craftObj = {
        registration: 'G-ABCD', 
        craftType: '', 
        craftBasePort: 'LHR', 
        craftBaseLat: null, 
        craftBaseLong: null,
        portChoice: 'Yes'
      };

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', {
          cookie, craftObj, errors: [rule],
        });
      });
    });

    it('should return message when base is empty', () => {
      req.body.craftBasePort = '';
      const rule = new ValidationRule(validator.notEmpty, 'craftBasePort', '', 'Enter an aircraft home port / location');
      const cookie = new CookieModel(req);

      const craftObj = {
        registration: 'G-ABCD', 
        craftType: 'Gulfstream', 
        craftBasePort: '', 
        craftBaseLat: null, 
        craftBaseLong: null,
        portChoice: 'Yes'
      };

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(craftApiStub).to.not.have.been.called;
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', {
          cookie, craftObj, errors: [rule],
        });
      });
    });
  });

  describe('craft api calls', () => {
    it('should return error message if api returns error', () => {
      const cookie = new CookieModel(req);
      craftApiStub.resolves(JSON.stringify({
        message: 'Some sort of error',
      }));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', { errors: [{ message: 'Some sort of error' }], cookie });
      });
    });

    it('should return error message if api does not return JSON', () => {
      const cookie = new CookieModel(req);
      craftApiStub.resolves('Example return');

      const craftObj = {
        registration: 'G-ABCD', 
        craftType: 'Gulfstream', 
        craftBasePort: 'LHR', 
        craftBaseLat: null, 
        craftBaseLong: null,
        portChoice: 'Yes'
      };

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', {
          cookie, craftObj, errors: [{ message: 'There was a problem saving the aircraft. Try again later' }],
        });
      });
    });

    it('should return error message if api does not return JSON and contains DETAIL:  Key (registration)', () => {
      const cookie = new CookieModel(req);
      craftApiStub.resolves('Something containing DETAIL:  Key (registration) ');

      const craftObj = {
        registration: 'G-ABCD', 
        craftType: 'Gulfstream', 
        craftBasePort: 'LHR', 
        craftBaseLat: null, 
        craftBaseLong: null,
        portChoice: 'Yes'
      };

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', {
          cookie, craftObj, errors: [{ message: 'Craft already exists' }],
        });
      });
    });

    it('should redirect when ok', () => {
      const cookie = new CookieModel(req);
      craftApiStub.resolves(JSON.stringify({}));
      sinon.stub(paginate, 'setCurrentPage');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(sessionSaveStub).to.have.been.called;
        expect(paginate.setCurrentPage).to.have.been.calledOnceWithExactly(req, '/aircraft', 1000000);
        expect(res.redirect).to.have.been.calledOnceWithExactly('/aircraft');
      });
    });
  });
});
