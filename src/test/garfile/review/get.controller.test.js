/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

const controller = require('../../../app/garfile/review/get.controller');

describe('GAR Review Get Controller', () => {
  let req; let res;
  let garApiGetStub; let garApiGetPeopleStub; let garApiGetSupportingDocsStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        arrivalPort: 'LHR',
        arrivalLat: '45.1000',
        arrivalLong: '12.1000',
        arrivalDay: '30',
        arrivalMonth: '5',
        arrivalYear: '2020',
        arrivalHour: '15',
        arrivalMinute: '00',
      },
      session: {
        gar: {
          id: 'ABCDE',
        },
        submiterrormessage: [],
        save: callback => callback(),
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
    garApiGetStub = sinon.stub(garApi, 'get');
    garApiGetPeopleStub = sinon.stub(garApi, 'getPeople');
    garApiGetSupportingDocsStub = sinon.stub(garApi, 'getSupportingDocs');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do nothing if retrieving a gar causes an issue', () => {
    const cookie = new CookieModel(req);
    garApiGetStub.resolves();
    garApiGetPeopleStub.resolves();
    garApiGetSupportingDocsStub.rejects('garApi.getSupportingDocs Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(cookie.getGarId()).to.eq('ABCDE');
      expect(garApiGetStub).to.have.been.calledWith(cookie.getGarId());
      expect(garApiGetPeopleStub).to.have.been.calledWith(cookie.getGarId());
      expect(garApiGetSupportingDocsStub).to.have.been.calledWith(cookie.getGarId());
      expect(res.render).to.have.been.calledWith('app/garfile/review/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
    });
  });

  it('should return error messages on validation', () => {
    const cookie = new CookieModel(req);
    garApiGetStub.resolves(JSON.stringify({
      status: {
        name: 'draft',
      },
    }));
    garApiGetPeopleStub.resolves(JSON.stringify({
      items: [],
    }));
    garApiGetSupportingDocsStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then().then(() => {
      expect(res.render).to.have.been.calledWith('app/garfile/review/index', {
        cookie,
        manifestFields,
        garfile: {
          status: {
            name: 'draft',
          },
        },
        garpeople: {
          items: [],
        },
        garsupportingdocs: {},
        showChangeLinks: true,
        errors: [
          new ValidationRule(validator.isValidDepAndArrDate, 'voyageDates', { arrivalDate: undefined, departureDate: undefined }, 'Arrival date must not be earlier than departure date'),
          new ValidationRule(validator.notEmpty, 'registration', undefined, 'Aircraft registration must be completed'),
          new ValidationRule(validator.notEmpty, 'responsibleGivenName', undefined, 'Responsible person details must be completed'),
        ],
      });
    });
  });

  it('sends render the page as appropriate', () => {
    const cookie = new CookieModel(req);
    garApiGetStub.resolves(JSON.stringify({
      registration: 'Z-AFTC',
      departureDate: '2012-12-13',
      arrivalDate: '2012-12-14',
      status: {
        name: 'draft',
      },
      responsibleGivenName: 'James',
    }));
    garApiGetPeopleStub.resolves(JSON.stringify({
      items: [
        { peopleType: { name: 'Captain' }, firstName: 'James', lastName: 'Kirk' },
      ],
    }));
    garApiGetSupportingDocsStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then().then(() => {
      expect(res.render).to.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/review/index', {
        cookie,
        manifestFields,
        garfile: {
          registration: 'Z-AFTC',
          departureDate: '2012-12-13',
          arrivalDate: '2012-12-14',
          status: {
            name: 'draft',
          },
          responsibleGivenName: 'James',
        },
        garpeople: {
          items: [{ peopleType: { name: 'Captain' }, firstName: 'James', lastName: 'Kirk' }],
        },
        garsupportingdocs: {},
        showChangeLinks: true,
      });
    });
  });
});
