/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const emailService = require('../../../common/services/sendEmail');
const prohibitedGoodsOptions = require('../../../common/seeddata/egar_prohibited_goods_options');
const reasonForVisitOptions = require('../../../common/seeddata/egar_visit_reason_options.json');
const freeCirculationOptions = require('../../../common/seeddata/egar_craft_eu_free_circulation_options.json');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

const controller = require('../../../app/garfile/customs/post.controller');

describe('GAR Customs Post Controller', () => {
  let req; let res;
  let garApiPatchStub;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      body: {
        prohibitedGoods: 0,
        freeCirculation: 0,
        visitReason: 2,
      },
      session: {
        gar: {
          id: 'ABCD-1234',
          status: 'Draft',
        },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    garApiPatchStub = sinon.stub(garApi, 'patch');
    emailServiceStub = sinon.stub(emailService, 'send');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should error on validation', () => {
    req.body.visitReason = '';
    const cookie = new CookieModel(req);
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.body.buttonClicked).to.be.undefined;
      expect(garApiPatchStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/customs/index', {
        freeCirculationOptions,
        reasonForVisitOptions,
        prohibitedGoodsOptions,
        cookie,
        gar: {
          prohibitedGoods: 0,
          freeCirculation: 0,
          visitReason: '',
        },
        errors: [
          new ValidationRule(validator.notEmpty, 'visitReason', '', 'Select a reason for visit'),
        ],
      });
    });
  });

  it('should show error if api rejects', () => {
    const cookie = new CookieModel(req);
    garApiPatchStub.rejects('garApi.patch Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApiPatchStub).to.have.been.calledWith('ABCD-1234', 'Draft', {
        prohibitedGoods: 0,
        freeCirculation: 0,
        visitReason: 2,
      });
      expect(res.render).to.have.been.calledWith('app/garfile/customs/index', {
        prohibitedGoodsOptions,
        freeCirculationOptions,
        reasonForVisitOptions,
        cookie,
        gar: {
          prohibitedGoods: 0,
          freeCirculation: 0,
          visitReason: 2,
        },
        errors: [{ message: 'Failed to save customs information. Try again' }],
      });
    });
  });

  it('should show error if api returns error message', () => {
    const cookie = new CookieModel(req);
    garApiPatchStub.resolves(JSON.stringify({
      message: 'GAR not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiPatchStub).to.have.been.calledWith('ABCD-1234', 'Draft', {
        prohibitedGoods: 0,
        freeCirculation: 0,
        visitReason: 2,
      });
      expect(res.render).to.have.been.calledWith('app/garfile/customs/index', {
        prohibitedGoodsOptions,
        freeCirculationOptions,
        reasonForVisitOptions,
        cookie,
        gar: {
          prohibitedGoods: 0,
          freeCirculation: 0,
          visitReason: 2,
        },
        errors: [{ message: 'GAR not found' }],
      });
    });
  });

  it('should go to the home page if no buttonClicked property', () => {
    garApiPatchStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.body.buttonClicked).to.be.undefined;
      expect(garApiPatchStub).to.have.been.calledWith('ABCD-1234', 'Draft', {
        prohibitedGoods: 0,
        freeCirculation: 0,
        visitReason: 2,
      });
      expect(res.redirect).to.have.been.calledWith('/home');
    });
  });

  it('should go to craft page if buttonClicked property is set', () => {
    req.body.buttonClicked = 'Save and continue';
    garApiPatchStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.body.buttonClicked).to.eq('Save and continue');
      expect(garApiPatchStub).to.have.been.calledWith('ABCD-1234', 'Draft', {
        prohibitedGoods: 0,
        freeCirculation: 0,
        visitReason: 2,
      });
      expect(res.redirect).to.have.been.calledWith('/garfile/supportingdocuments');
    });
  });
});
