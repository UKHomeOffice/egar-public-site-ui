
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const i18n = require('i18n');
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
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

    sinon.stub(i18n, '__').callsFake((key) => {
      switch (key) {
        case 'validator_msg_voyage_dates':
          return 'Arrival time must be after departure time';
        default:
          return '';
      }
    });
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
          new ValidationRule(validator.isValidDepAndArrDate, 'departure', {
            arrivalDate: undefined, arrivalTime: undefined, departureDate: undefined, departureTime: undefined,
          }, 'Arrival time must be after departure time'),
          new ValidationRule(validator.notEmpty, 'aircraft', undefined, 'Aircraft registration must be completed'),
          new ValidationRule(validator.notEmpty, 'responsiblePerson', undefined, 'Responsible person details must be completed'),
          new ValidationRule(validator.notEmpty, 'customs', undefined, 'Customs declaration questions not answered'),
        ],
      });
    });
  });

  it('should render the page but log out a message if API returns one', () => {
    const cookie = new CookieModel(req);
    garApiGetStub.resolves(JSON.stringify({
      registration: 'Z-AFTC',
      departureDate: '2012-12-13',
      departureTime: '15:03:00',
      arrivalDate: '2012-12-14',
      arrivalTime: '16:04:00',
      status: {
        name: 'draft',
      },
      responsibleGivenName: 'James',
      prohibitedGoods: 'No',
      freeCirculation: 'No',
      visitReason: 'No',
    }));
    garApiGetPeopleStub.resolves(JSON.stringify({
      items: [
        { peopleType: { name: 'Captain' }, firstName: 'James', lastName: 'Kirk' },
      ],
    }));
    garApiGetSupportingDocsStub.resolves(JSON.stringify({
      message: 'GAR not found',
    }));

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
          departureTime: '15:03:00',
          arrivalDate: '2012-12-14',
          arrivalTime: '16:04:00',
          status: {
            name: 'draft',
          },
          responsibleGivenName: 'James',
          prohibitedGoods: 'No',
          freeCirculation: 'No',
          visitReason: 'No',
        },
        garpeople: {
          items: [{ peopleType: { name: 'Captain' }, firstName: 'James', lastName: 'Kirk' }],
        },
        garsupportingdocs: {
          message: 'GAR not found',
        },
        showChangeLinks: true,
      });
    });
  });

  it('should render the page as appropriate', () => {
    const cookie = new CookieModel(req);
    garApiGetStub.resolves(JSON.stringify({
      registration: 'Z-AFTC',
      departureDate: '2012-12-13',
      departureTime: '15:04:00',
      arrivalDate: '2012-12-14',
      arrivalTime: '08:17:00',
      status: {
        name: 'draft',
      },
      responsibleGivenName: 'James',
      prohibitedGoods: 'No',
      freeCirculation: 'No',
      visitReason: 'No',
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
          departureTime: '15:04:00',
          arrivalDate: '2012-12-14',
          arrivalTime: '08:17:00',
          status: {
            name: 'draft',
          },
          responsibleGivenName: 'James',
          prohibitedGoods: 'No',
          freeCirculation: 'No',
          visitReason: 'No',
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
