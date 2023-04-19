/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

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
    sinon.stub(garApi, 'get').rejects('garApi.get Example Reject', () => {
      expect(res.render).to.have.been.calledWith('app/garfile/responsibleperson/index', {
        cookie, errors: [{ message: 'Problem retrieving GAR' }],
      });
    });

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {

    });
  });

  it('should render the page as appropriate', () => {
    const apiResponse = {
      responsibleGivenName: 'Jean-Luc',
      responsibleSurname: 'Picard',
      responsibleAddressLine1: 'Enterprise',
      responsibleAddressLine2: 'United Federation of Planets',
      responsibleTown: 'Alpha Quadrant',
      responsiblePostcode: 'NCC-1701D',
      responsibleCounty: 'Earth',
      responsibleContactNo: '1234567890',
    };
    const cookie = new CookieModel(req);
    cookie.setGarResponsiblePerson(apiResponse);
    sinon.stub(garApi, 'get').resolves(JSON.stringify(apiResponse), () => {
      expect(res.render).to.have.been.calledWith('app/garfile/responsibleperson/index', { cookie });
    });

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
     
    });
  });
});
