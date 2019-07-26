/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const craftApi = require('../../../common/services/craftApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/aircraft/add/post.controller');
const paginate = require('../../../common/utils/pagination');

describe('Aircraft Add Post Controller', () => {
  let req; let res; let craftApiStub; let sessionSaveStub;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example response object with appropriate spies
    req = {
      body: {
        craftReg: 'G-ABCD',
        craftType: 'Gulfstream',
        craftBase: 'LHR',
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
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('validation chains', () => {
    it('should return message when registration is empty', () => {
      req.body.craftReg = '';
      const rule = new ValidationRule(validator.notEmpty, 'craftReg', '', 'Enter the registration details of the craft');
      const cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', { cookie, errors: [rule] });
      });
    });

    it('should return message when type is empty', () => {
      req.body.craftType = '';
      const rule = new ValidationRule(validator.notEmpty, 'craftType', '', 'Enter the craft type');
      const cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        // TODO: Cookie and Error Message Check
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', { cookie, errors: [rule] });
      });
    });

    it('should return message when base is empty', () => {
      req.body.craftBase = '';
      const rule = new ValidationRule(validator.notEmpty, 'craftBase', '', 'Enter the base of the craft');
      const cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(craftApiStub).to.not.have.been.called;
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', { cookie, errors: [rule] });
      });
    });
  });

  describe('craft api calls', () => {
    it('should return error message if api returns error', () => {
      cookie = new CookieModel(req);
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
      cookie = new CookieModel(req);
      craftApiStub.resolves('Example return');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', { errors: [{ message: 'There was a problem saving the aircraft. Try again later' }], cookie });
      });
    });

    it('should return error message if api does not return JSON and contains DETAIL:  Key (registration)', () => {
      cookie = new CookieModel(req);
      craftApiStub.resolves('Something containing DETAIL:  Key (registration) ');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', { cookie, errors: [{ message: 'Craft already exists' }] });
      });
    });

    it('should redirect when ok', () => {
      cookie = new CookieModel(req);
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
