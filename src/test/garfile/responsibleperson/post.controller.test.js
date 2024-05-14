/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const i18n = require('i18n');
const path = require('path');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const garApi = require('../../../common/services/garApi');
const { MAX_STRING_LENGTH } = require('../../../common/config/index');

const controller = require('../../../app/garfile/responsibleperson/post.controller');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');

i18n.configure({
  locales: ['en'],
  directory: path.join(__dirname, '../../../locales'),
  objectNotation: true,
  defaultLocale: 'en',
  register: global,
});

describe('GAR Responsible Person Post Controller', () => {
  let req, res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        responsibleGivenName: 'Jean-Luc',
        responsibleSurname: 'Picard',
        responsibleContactNo: '001234567890',
        responsibleEmail: 'test@test.com',
        responsibleAddressLine1: 'Enterprise',
        responsibleAddressLine2: 'United Federation of Planets',
        responsibleTown: 'Alpha Quadrant',
        responsiblePostcode: 'NCC-1701D',
        responsibleCounty: 'GBR',
        fixedBasedOperator: 'Fixed Base Operator',
        fixedBasedOperatorAnswer: ''
      },
      session: {
        gar: { id: '123456', status: 'Draft', responsiblePerson: {} },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with validations messages if email is empty', async () => {
    req.body.responsibleEmail = '';
    cookie = new CookieModel(req);
    cookie.setGarResponsiblePerson(req.body);
    sinon.stub(garApi, 'patch');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.patch).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/responsibleperson/index', {
        req,
        cookie,
        fixedBasedOperatorOptions,
        errors: [
          new ValidationRule(validator.notEmpty, 'responsibleEmail', '', 'You must enter an email for the responsible person'),
        ],
      });
    });
  });

  it('should render with validations messages if given name is empty', async () => {
    req.body.responsibleGivenName = '';
    cookie = new CookieModel(req);
    cookie.setGarResponsiblePerson(req.body);
    sinon.stub(garApi, 'patch');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.patch).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/responsibleperson/index', {
        req,
        cookie,
        fixedBasedOperatorOptions,
        errors: [
          new ValidationRule(validator.notEmpty, 'responsibleGivenName', '', 'Enter a given name for the responsible person'),
        ],
      });
    });
  });

  it('should render with validation messages if given name is too long', async () => {
    req.body.responsibleGivenName = 'abcdefghijklmnopqrstuvwxyz1234567890';
    cookie = new CookieModel(req);
    cookie.setGarResponsiblePerson(req.body);
    sinon.stub(garApi, 'patch');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.patch).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/responsibleperson/index', {
        req,
        cookie,
        fixedBasedOperatorOptions,
        errors: [
          new ValidationRule(validator.isValidStringLength, 'responsibleGivenName', 'abcdefghijklmnopqrstuvwxyz1234567890', `Given name must be ${MAX_STRING_LENGTH} characters or less`),
        ],
      });
    });
  });

  it('should render error message if api rejects', () => {
    cookie = new CookieModel(req);
    cookie.setGarResponsiblePerson(req.body);
    sinon.stub(garApi, 'patch').rejects('garApi.patch Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.patch).to.have.been.calledWith('123456', 'Draft', {
        responsibleGivenName: 'Jean-Luc',
        responsibleSurname: 'Picard',
        responsibleContactNo: '001234567890',
        responsibleEmail: 'test@test.com',
        responsibleAddressLine1: 'Enterprise',
        responsibleAddressLine2: 'United Federation of Planets',
        responsibleTown: 'Alpha Quadrant',
        responsiblePostcode: 'NCC-1701D',
        responsibleCounty: 'GBR',
        fixedBasedOperator: 'Fixed Base Operator',
        fixedBasedOperatorAnswer: '',
        fixedBasedOperatorOptions
      });
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/responsibleperson/index', {
        cookie,
        fixedBasedOperatorOptions,
        errors: [{
          message: 'Failed to add to GAR',
        }],
      });
    });
  });

  it('should display the error message if api returns one', () => {
    cookie = new CookieModel(req);
    sinon.stub(garApi, 'patch').resolves(JSON.stringify({
      message: 'GAR not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.patch).to.have.been.calledWith('123456', 'Draft', {
        responsibleGivenName: 'Jean-Luc',
        responsibleSurname: 'Picard',
        responsibleContactNo: '001234567890',
        responsibleEmail: 'test@test.com',
        responsibleAddressLine1: 'Enterprise',
        responsibleAddressLine2: 'United Federation of Planets',
        responsibleTown: 'Alpha Quadrant',
        responsiblePostcode: 'NCC-1701D',
        responsibleCounty: 'GBR',
        fixedBasedOperator: 'Fixed Base Operator',
        fixedBasedOperatorAnswer: '',
        fixedBasedOperatorOptions
      });
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/responsibleperson/index', {
        cookie,
        fixedBasedOperatorOptions,
        errors: [{
          message: 'GAR not found',
        }],
      });
    });
  });

  it('should redirect to home if buttonClicked is not set', () => {
    cookie = new CookieModel(req);
    cookie.setGarResponsiblePerson(req.body);
    sinon.stub(garApi, 'patch').resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.patch).to.have.been.calledWith('123456', 'Draft', {
        responsibleGivenName: 'Jean-Luc',
        responsibleSurname: 'Picard',
        responsibleContactNo: '001234567890',
        responsibleEmail: 'test@test.com',
        responsibleAddressLine1: 'Enterprise',
        responsibleAddressLine2: 'United Federation of Planets',
        responsibleTown: 'Alpha Quadrant',
        responsiblePostcode: 'NCC-1701D',
        responsibleCounty: 'GBR',
        fixedBasedOperator: 'Fixed Base Operator',
        fixedBasedOperatorAnswer: '',
        fixedBasedOperatorOptions
      });
      expect(res.render).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly(307, '/garfile/view');
    });
  });

  it('should redirect to customs page if buttonClicked is Save and continue', () => {
    req.body.buttonClicked = 'Save and continue';
    cookie = new CookieModel(req);
    cookie.setGarResponsiblePerson(req.body);
    sinon.stub(garApi, 'patch').resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.patch).to.have.been.calledWith('123456', 'Draft', {
        responsibleGivenName: 'Jean-Luc',
        responsibleSurname: 'Picard',
        responsibleContactNo: '001234567890',
        responsibleEmail: 'test@test.com',
        responsibleAddressLine1: 'Enterprise',
        responsibleAddressLine2: 'United Federation of Planets',
        responsibleTown: 'Alpha Quadrant',
        responsiblePostcode: 'NCC-1701D',
        responsibleCounty: 'GBR',
        fixedBasedOperator: 'Fixed Base Operator',
        fixedBasedOperatorAnswer: '',
        fixedBasedOperatorOptions
      });
      expect(res.render).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/garfile/customs');
    });
  });
});
