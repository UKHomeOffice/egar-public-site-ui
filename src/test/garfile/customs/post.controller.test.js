/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const emailService = require('../../../common/services/sendEmail');
const prohibitedGoodsOptions = require('../../../common/seeddata/egar_prohibited_goods_options');
const reasonForVisitOptions = require('../../../common/seeddata/egar_visit_reason_options.json');
const baggageOptions = require('../../../common/seeddata/egar_baggage_options.json');
const intentionValueOptions = require('../../../common/seeddata/egar_intention_value_options.json');
const freeCirculationOptions = require('../../../common/seeddata/egar_craft_eu_free_circulation_options.json');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

const controller = require('../../../app/garfile/customs/post.controller');

describe('GAR Customs Post Controller', () => {
  let req; let res;
  let garApiPatchStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        prohibitedGoods: 'Yes',
        goodsDeclaration: 'Duty Free',
        freeCirculation: 0,
        visitReason: 2,
        intentionValue: 'Yes'
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
    delete req.body.intentionValue;
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
        baggageOptions,
        intentionValueOptions,
        cookie,
        gar: {
          baggage: undefined,
          baggageDeclaration: '',
          prohibitedGoods: 'Yes',
          goodsDeclaration: 'Duty Free',
          intentionValue: undefined,
          passengerTravellingReason: '',
          passengerTravellingReasonAnswer: '',
          supportingInformation: undefined,
          supportingInformationAnswer: '',
          freeCirculation: 0,
          visitReason: '',
        },
        errors: [
          new ValidationRule(validator.notEmpty, 'visitReason', '', 'Select a reason for visit'),
          new ValidationRule(validator.notEmpty, 'intentionValue', undefined, 'Select a value for customs declaration')
        ],
      });
    });
  });

  it('should render with validation message if customs declaration is "Yes" and declaration details is empty string', () => {
    req.body.prohibitedGoods = 'Yes';
    req.body.goodsDeclaration = '          ';
    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiPatchStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/customs/index', {
        freeCirculationOptions,
        reasonForVisitOptions,
        prohibitedGoodsOptions,
        intentionValueOptions,
        baggageOptions,
        cookie,
        gar: {
          baggage: undefined,
          baggageDeclaration: '',
          freeCirculation: 0,
          goodsDeclaration: '',
          intentionValue: 'Yes',
          passengerTravellingReason: '',
          passengerTravellingReasonAnswer: '',
          prohibitedGoods: "Yes",
          supportingInformation: undefined,
          supportingInformationAnswer: '',
          visitReason: 2
        },
        errors: [
          new ValidationRule(validator.notEmpty, 'goodsDeclaration', '', 'Please enter customs declaration details'),
        ],
      });
    });
  });

  it('should render with validation message if customs declaration is "Yes" and declaration details is undefined', () => {
    req.body.prohibitedGoods = 'Yes';
    delete req.body.goodsDeclaration;
    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiPatchStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/customs/index', {
        freeCirculationOptions,
        reasonForVisitOptions,
        prohibitedGoodsOptions,
        baggageOptions,
        intentionValueOptions,
        cookie,
        gar: {
          baggage: undefined,
          baggageDeclaration: '',
          freeCirculation: 0,
          goodsDeclaration: '',
          intentionValue: 'Yes',
          passengerTravellingReason: '',
          passengerTravellingReasonAnswer: '',
          prohibitedGoods: "Yes",
          supportingInformation: undefined,
          supportingInformationAnswer: '',
          visitReason: 2
        },
        errors: [
          new ValidationRule(validator.notEmpty, 'goodsDeclaration', '', 'Please enter customs declaration details'),
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
        baggage: undefined,
        baggageDeclaration: '',
        freeCirculation: 0,
        goodsDeclaration: "Duty Free",
        intentionValue: "Yes",
        passengerTravellingReason: '',
        passengerTravellingReasonAnswer: '',
        prohibitedGoods: "Yes",
        supportingInformation: undefined,
        supportingInformationAnswer:  '',
        visitReason: 2
      });
      expect(res.render).to.have.been.calledWith('app/garfile/customs/index', {
        freeCirculationOptions,
        reasonForVisitOptions,
        prohibitedGoodsOptions,
        baggageOptions,
        intentionValueOptions,
        cookie,
        gar: {
          baggage: undefined,
          baggageDeclaration: '',
          freeCirculation: 0,
          goodsDeclaration: "Duty Free",
          intentionValue: "Yes",
          passengerTravellingReason: '',
          passengerTravellingReasonAnswer: '',
          prohibitedGoods: "Yes",
          supportingInformation: undefined,
          supportingInformationAnswer: '',
          visitReason: 2
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
        baggage: undefined,
        baggageDeclaration: '',
        freeCirculation: 0,
        goodsDeclaration: "Duty Free",
        intentionValue: "Yes",
        passengerTravellingReason: '',
        passengerTravellingReasonAnswer: '',
        prohibitedGoods: "Yes",
        supportingInformation: undefined,
        supportingInformationAnswer: '',
        visitReason: 2
      });
      expect(res.render).to.have.been.calledWith('app/garfile/customs/index', {
        prohibitedGoodsOptions,
        freeCirculationOptions,
        reasonForVisitOptions,
        intentionValueOptions,
        baggageOptions,
        cookie,
        gar: {
          baggage: undefined,
          baggageDeclaration: '',
          freeCirculation: 0,
          goodsDeclaration: "Duty Free",
          intentionValue: "Yes",
          passengerTravellingReason: '',
          passengerTravellingReasonAnswer: '',
          prohibitedGoods: "Yes",
          supportingInformation: undefined,
          supportingInformationAnswer: '',
          visitReason: 2
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
        baggage: undefined,
        baggageDeclaration: '',
        freeCirculation: 0,
        goodsDeclaration: "Duty Free",
        intentionValue: "Yes",
        passengerTravellingReason: '',
        passengerTravellingReasonAnswer: '',
        prohibitedGoods: "Yes",
        supportingInformation: undefined,
        supportingInformationAnswer: '',
        visitReason: 2
      });
      expect(res.redirect).to.have.been.calledOnceWithExactly(307, '/garfile/view');
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
        baggage: undefined,
        baggageDeclaration:'',
        freeCirculation: 0,
        goodsDeclaration: "Duty Free",
        intentionValue: "Yes",
        passengerTravellingReason: '',
        passengerTravellingReasonAnswer: '',
        prohibitedGoods: "Yes",
        supportingInformation: undefined,
        supportingInformationAnswer: '',
        visitReason: 2
      });
      expect(res.redirect).to.have.been.calledWith('/garfile/supportingdocuments');
    });
  });

  it('should set goodsDeclaration=empty string if prohibitedGoods!=Yes', () => {
    req.body.buttonClicked = 'Save and continue';
    req.body.prohibitedGoods = 'No';
    garApiPatchStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.body.buttonClicked).to.eq('Save and continue');
      expect(garApiPatchStub).to.have.been.calledWith('ABCD-1234', 'Draft', {
        baggage: undefined,
        baggageDeclaration: '',
        freeCirculation: 0,
        goodsDeclaration: '',
        intentionValue: "Yes",
        passengerTravellingReason: '',
        passengerTravellingReasonAnswer: '',
        prohibitedGoods: "No",
        supportingInformation: undefined,
        supportingInformationAnswer: '',
        visitReason: 2
      });
      expect(res.redirect).to.have.been.calledWith('/garfile/supportingdocuments');
    });
  });

  it('should set goodsDeclaration=empty string if prohibitedGoods=random string', () => {
    req.body.buttonClicked = 'Save and continue';
    req.body.prohibitedGoods = 'adFnjKekNnveAiej1324mk';
    garApiPatchStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.body.buttonClicked).to.eq('Save and continue');
      expect(garApiPatchStub).to.have.been.calledWith('ABCD-1234', 'Draft', {
        baggage: undefined,
        baggageDeclaration: '',
        freeCirculation: 0,
        goodsDeclaration: '',
        intentionValue: "Yes",
        passengerTravellingReason: '',
        passengerTravellingReasonAnswer: '',
        prohibitedGoods: "adFnjKekNnveAiej1324mk",
        supportingInformation: undefined,
        supportingInformationAnswer:  '',
        visitReason: 2
      });
      expect(res.redirect).to.have.been.calledWith('/garfile/supportingdocuments');
    });
  });

  it('should set goodsDeclaration=empty string if prohibitedGoods=No', () => {
    req.body.buttonClicked = 'Save and continue';
    req.body.prohibitedGoods = 'No';
    req.body.goodsDeclaration = 'adFnjKekNnveAiej1324mk';
    garApiPatchStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.body.buttonClicked).to.eq('Save and continue');
      expect(garApiPatchStub).to.have.been.calledWith('ABCD-1234', 'Draft', {
        baggage: undefined,
        baggageDeclaration: '',
        freeCirculation: 0,
        goodsDeclaration: '',
        intentionValue: "Yes",
        passengerTravellingReason: '',
        passengerTravellingReasonAnswer: '',
        prohibitedGoods: "No",
        supportingInformation: undefined,
        supportingInformationAnswer:  '',
        visitReason: 2
      });
      expect(res.redirect).to.have.been.calledWith('/garfile/supportingdocuments');
    });
  });

  it('should trim white spaces for goodsDeclaration', () => {
    req.body.buttonClicked = 'Save and continue';
    req.body.prohibitedGoods = 'Yes';
    req.body.goodsDeclaration = '      a      ';
    garApiPatchStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiPatchStub).to.have.been.calledWith('ABCD-1234', 'Draft', {
        baggage: undefined,
        baggageDeclaration: '',
        prohibitedGoods: 'Yes',
        goodsDeclaration: 'a',
        freeCirculation: 0,
        visitReason: 2,
        intentionValue: "Yes",
        passengerTravellingReason: '',
        passengerTravellingReasonAnswer: '',
        supportingInformation: undefined,
        supportingInformationAnswer:  '',
      });
      expect(res.redirect).to.have.been.calledWith('/garfile/supportingdocuments');
    });
  });

});
