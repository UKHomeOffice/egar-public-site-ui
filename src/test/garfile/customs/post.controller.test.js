const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const { garApi } = require('../../../common/services/dataAccessApi');
const CookieModel = require('../../../common/models/Cookie.class');
const prohibitedGoodsOptions = require('../../../common/seeddata/egar_prohibited_goods_options');
const reasonForVisitOptions = require('../../../common/seeddata/egar_visit_reason_options.json');
const baggageOptions = require('../../../common/seeddata/egar_baggage_options.json');
const intentionValueOptions = require('../../../common/seeddata/egar_intention_value_options.json');
const freeCirculationOptions = require('../../../common/seeddata/egar_craft_eu_free_circulation_options.json');
const continentalShelfOptions = require('../../../common/seeddata/egar_continental_shelf_options.json');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const controller = require('../../../app/garfile/customs/post.controller');

describe('GAR Customs Post Controller', () => {
  let req;
  let res;
  let patch;
  let customs;

  beforeEach(() => {
    req = {
      body: {
        continentalShelf: 'No',
        prohibitedGoods: 'Yes',
        goodsDeclaration: 'Duty Free',
        continentalShelfDeclaration: '',
        freeCirculation: 0,
        visitReason: 2,
        intentionValue: 'Yes',
        buttonClicked: 'Save and continue',
      },
      session: { gar: { id: 'stale-session-id', status: 'Draft' } },
    };
    res = { redirect: sinon.spy(), render: sinon.spy(), locals: { gar: { garId: 'ABCD-1234' } } };
    patch = sinon.stub(garApi, 'patch').resolves({});
    customs = {
      baggage: undefined,
      baggageDeclaration: '',
      continentalShelf: 'No',
      continentalShelfDeclaration: '',
      freeCirculation: 0,
      goodsDeclaration: 'Duty Free',
      intentionValue: 'Yes',
      passengerTravellingReason: '',
      passengerTravellingReasonAnswer: '',
      prohibitedGoods: 'Yes',
      supportingInformation: undefined,
      supportingInformationAnswer: '',
      visitReason: 2,
    };
  });

  afterEach(() => sinon.restore());

  function expectErrors(errors) {
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/customs/index', {
      freeCirculationOptions,
      reasonForVisitOptions,
      prohibitedGoodsOptions,
      baggageOptions,
      intentionValueOptions,
      continentalShelfOptions,
      cookie: new CookieModel(req),
      gar: customs,
      errors,
    });
  }

  it('retains submitted declarations and renders validation errors without updating the GAR', async () => {
    req.body.visitReason = '';
    delete req.body.intentionValue;
    customs.visitReason = '';
    customs.intentionValue = undefined;

    await controller(req, res);

    expect(patch).not.to.have.been.called;
    expectErrors([
      new ValidationRule(validator.notEmpty, 'visitReason', '', 'Select a reason for visit'),
      new ValidationRule(validator.notEmpty, 'intentionValue', undefined, 'Select a value for customs declaration'),
    ]);
  });

  it('requires declaration details after trimming whitespace', async () => {
    req.body.goodsDeclaration = '          ';
    customs.goodsDeclaration = '';
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors([
      new ValidationRule(validator.notEmpty, 'goodsDeclaration', '', 'Please enter customs declaration details'),
    ]);
  });

  it('requires declaration details when missing', async () => {
    delete req.body.goodsDeclaration;
    customs.goodsDeclaration = '';
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors([
      new ValidationRule(validator.notEmpty, 'goodsDeclaration', '', 'Please enter customs declaration details'),
    ]);
  });

  it('retains declarations and shows a generic error when saving fails', async () => {
    patch.rejects(new Error('Connection unavailable'));
    await controller(req, res);
    expectErrors([{ message: 'Failed to save customs information. Try again' }]);
  });

  it('preserves the backend message when saving rejects with an HTTP error', async () => {
    patch.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'GAR not found' },
      })
    );
    await controller(req, res);
    expectErrors([{ message: 'GAR not found' }]);
  });

  it('renders a decoded API error rather than continuing', async () => {
    patch.resolves({ message: 'GAR not found' });
    await controller(req, res);
    expectErrors([{ message: 'GAR not found' }]);
  });

  it('saves declarations to the verified GAR and continues to supporting documents', async () => {
    req.body.goodsDeclaration = '   Duty Free   ';
    await controller(req, res);
    expect(patch).to.have.been.calledOnceWithExactly('ABCD-1234', 'Draft', customs);
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments');
  });

  it('returns to the GAR view for the other save action', async () => {
    req.body.buttonClicked = 'Save';
    await controller(req, res);
    expect(patch).to.have.been.calledOnceWithExactly('ABCD-1234', 'Draft', customs);
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly(307, '/garfile/view');
  });

  it('clears stale conditional answers when the corresponding selections are No', async () => {
    Object.assign(req.body, {
      prohibitedGoods: 'No',
      goodsDeclaration: 'Old goods',
      baggage: 'No',
      baggageDeclaration: 'Old baggage',
      continentalShelf: 'No',
      continentalShelfDeclaration: 'Old shelf details',
      supportingInformation: 'No',
      supportingInformationAnswer: 'Old information',
      passengerTravellingReason: 'No',
      passengerTravellingReasonAnswer: 'Old reason',
    });
    Object.assign(customs, {
      prohibitedGoods: 'No',
      goodsDeclaration: '',
      baggage: 'No',
      baggageDeclaration: '',
      supportingInformation: 'No',
      supportingInformationAnswer: '',
      passengerTravellingReason: 'No',
      passengerTravellingReasonAnswer: '',
    });
    await controller(req, res);
    expect(patch).to.have.been.calledOnceWithExactly('ABCD-1234', 'Draft', customs);
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments');
  });
});
