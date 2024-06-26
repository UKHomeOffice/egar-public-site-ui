/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');

const controller = require('../../../app/garfile/responsibleperson/get.controller');

describe('GAR Responsible Person Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {},
    };
    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with messages if api rejects', async () => {
    cookie = new CookieModel(req);
    const context = {
      fixedBasedOperatorOptions,
      cookie,
    };

    sinon.stub(garApi, 'get').rejects('garApi.get Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledWith('app/garfile/responsibleperson/index',
        context, {
        errors: [{ message: 'Problem retrieving GAR' }],
      });
    });
  });

  it('should render the page as appropriate', () => {
    const apiResponse = {
      responsibleGivenName: 'Jean-Luc',
      responsibleSurname: 'Picard',
      responsibleContactNo: '1234567890',
      responsibleEmail: 'test@test.com',
      responsibleAddressLine1: 'Enterprise',
      responsibleAddressLine2: 'United Federation of Planets',
      responsibleTown: 'Alpha Quadrant',
      responsiblePostcode: 'NCC-1701D',
      responsibleCounty: 'GBR',
      fixedBasedOperator: 'Captain',
      fixedBasedOperatorAnswer: ''
    };
    const cookie = new CookieModel(req);
    cookie.setGarResponsiblePerson(apiResponse);

    const context = {
      fixedBasedOperatorOptions,
      cookie,
      gar: apiResponse
    };

    sinon.stub(garApi, 'get').resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledWith('app/garfile/responsibleperson/index', context);
    });
  });
});
