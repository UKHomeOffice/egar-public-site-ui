/* eslint-disable no-undef */

const i18n = require('i18n');
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const moment = require('moment');

require('../../global.test');
const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const { Manifest } = require('../../../common/models/Manifest.class');
const controller = require('../../../app/garfile/review/post.controller');
const { garPeople } = require('../../fixtures');

describe('GAR Review Post Controller', () => {
  let req;
  let res;
  let clock;
  const APRIL = 3;
  let garApiGetStub;
  let garApiGetPeopleStub;
  let garApiGetSupportingDocsStub;
  let garAPISubmitForCheckinStub;
  let sessionSaveStub;

  beforeEach(() => {
    chai.use(sinonChai);
    clock = sinon.useFakeTimers({
      now: new Date(2023, APRIL, 11),
      shouldAdvanceTime: false,
      toFake: ['Date'],
    });

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
        save: (callback) => callback(),
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
    garAPISubmitForCheckinStub = sinon.stub(garApi, 'submitGARForCheckin');

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
    clock.restore();
  });

  it('should do nothing if retrieving a gar causes an issue', () => {
    const cookie = new CookieModel(req);
    garApiGetStub.resolves();
    garApiGetPeopleStub.resolves();
    garApiGetSupportingDocsStub.rejects('garApi.getSupportingDocs Example Reject');

    controller(req, res).then(() => {
      expect(cookie.getGarId()).to.eq('ABCDE');
      expect(garApiGetStub).to.have.been.calledWith(cookie.getGarId());
      expect(garApiGetPeopleStub).to.have.been.calledWith(cookie.getGarId());
      expect(garApiGetSupportingDocsStub).to.have.been.calledWith(cookie.getGarId());
      expect(res.render).to.have.been.calledWith('app/garfile/review/index', {
        cookie,
        errors: [{ message: 'There was an error retrieving the GAR. Try again later' }],
      });
    });
  });

  it('should inform user when GAR is submitted already', () => {
    garApiGetStub.resolves(
      JSON.stringify({
        status: {
          name: 'SUBMITTED',
        },
      })
    );
    garApiGetPeopleStub.resolves(
      JSON.stringify({
        items: [],
      })
    );
    garApiGetSupportingDocsStub.resolves(JSON.stringify({}));

    controller(req, res).then(() => {
      expect(sessionSaveStub).to.have.been.called;
      expect(req.session.submiterrormessage).to.eql([
        {
          message: 'This GAR has already been submitted',
          identifier: '',
        },
      ]);
      expect(res.redirect).to.have.been.calledWith('/garfile/review');
    });
  });

  it('should not submit GAR when validation errors', () => {
    const cookie = new CookieModel(req);
    const departDateObj = {
      d: undefined,
      m: undefined,
      y: undefined,
    };

    garApiGetStub.resolves(
      JSON.stringify({
        status: {
          name: 'draft',
        },
      })
    );
    garApiGetPeopleStub.resolves(
      JSON.stringify({
        items: [],
      })
    );
    garApiGetSupportingDocsStub.resolves(JSON.stringify({}));

    controller(req, res).then(() => {
      expect(res.render).to.have.been.called;
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
          new ValidationRule(
            validator.isValidDepAndArrDate,
            'departure',
            {
              arrivalDate: undefined,
              arrivalTime: undefined,
              departureDate: undefined,
              departureTime: undefined,
            },
            'Arrival time must be after departure time'
          ),
          new ValidationRule(validator.notEmpty, 'aircraft', undefined, 'Aircraft registration must be completed'),
          new ValidationRule(
            validator.notEmpty,
            'responsiblePerson',
            undefined,
            'Responsible person details must be completed'
          ),
          new ValidationRule(validator.notEmpty, 'customs', undefined, 'Visit Reason question not answered'),
          new ValidationRule(
            validator.notEmpty,
            'intentionValue',
            undefined,
            'Customs Declaration question not answered'
          ),
          new ValidationRule(
            validator.realDate,
            'departureDate',
            departDateObj,
            __('field_departure_real_date_validation')
          ),
          new ValidationRule(
            validator.valuetrue,
            'manifest',
            '',
            "There must be at least one captain or crew member on the voyage. If this is a military flight, this error can be bypassed in the manifest's military flight section."
          ),
        ],
      });
    });
  });

  it('should not submit GAR when validation errors, with manifest issues', () => {
    const cookie = new CookieModel(req);
    const departDateObj = {
      d: undefined,
      m: undefined,
      y: undefined,
    };

    sinon.stub(Manifest.prototype, 'validate').returns(false);
    garApiGetStub.resolves(
      JSON.stringify({
        status: {
          name: 'draft',
        },
      })
    );
    garApiGetPeopleStub.resolves(
      JSON.stringify({
        items: [
          {
            firstName: 'Richard',
            lastName: 'York',
          },
        ],
      })
    );
    garApiGetSupportingDocsStub.resolves(JSON.stringify({}));

    controller(req, res).then(() => {
      expect(res.render).to.have.been.calledWith('app/garfile/review/index', {
        cookie,
        manifestFields,
        garfile: {
          status: {
            name: 'draft',
          },
        },
        garpeople: {
          items: [{ firstName: 'Richard', lastName: 'York' }],
        },
        garsupportingdocs: {},
        showChangeLinks: true,
        errors: [
          new ValidationRule(
            validator.isValidDepAndArrDate,
            'departure',
            {
              arrivalDate: undefined,
              arrivalTime: undefined,
              departureDate: undefined,
              departureTime: undefined,
            },
            'Arrival time must be after departure time'
          ),
          new ValidationRule(validator.notEmpty, 'aircraft', undefined, 'Aircraft registration must be completed'),
          new ValidationRule(
            validator.notEmpty,
            'responsiblePerson',
            undefined,
            'Responsible person details must be completed'
          ),
          new ValidationRule(validator.notEmpty, 'customs', undefined, 'Visit Reason question not answered'),
          new ValidationRule(
            validator.notEmpty,
            'intentionValue',
            undefined,
            'Customs Declaration question not answered'
          ),
          new ValidationRule(
            validator.realDate,
            'departureDate',
            departDateObj,
            __('field_departure_real_date_validation')
          ),
          new ValidationRule(validator.valuetrue, 'resolveError', '', 'Resolve manifest errors before submitting'),
          new ValidationRule(
            validator.valuetrue,
            'manifest',
            '',
            "There must be at least one captain or crew member on the voyage. If this is a military flight, this error can be bypassed in the manifest's military flight section."
          ),
        ],
      });
    });
  });

  describe('perform API call', () => {
    it('should go to failure if API rejects', () => {
      const cookie = new CookieModel(req);

      const THREE_HOURS = 60 * 60 * 1000 * 3;
      const FOUR_HOURS = 60 * 60 * 1000 * 10;
      const today = new Date();
      const threeHourDate = moment.utc(new Date(today.getTime() + THREE_HOURS));
      const fourHoursDate = moment.utc(new Date(today.getTime() + FOUR_HOURS));

      garApiGetStub.resolves(
        JSON.stringify({
          registration: 'Z-AFTC',
          departureDate: threeHourDate.format('YYYY-MM-DD'),
          departureTime: threeHourDate.format('HH:mm:ss'),
          arrivalDate: fourHoursDate.format('YYYY-MM-DD'),
          arrivalTime: fourHoursDate.format('HH:mm:ss'),
          status: {
            name: 'draft',
          },
          responsibleGivenName: 'James',
          prohibitedGoods: 'No',
          freeCirculation: 'No',
          visitReason: 'No',
          intentionValue: 'No',
        })
      );

      garApiGetPeopleStub.resolves(
        JSON.stringify({
          items: garPeople(),
        })
      );

      garAPISubmitForCheckinStub.rejects('garApi.submitGARForCheckin Example Reject');
      garApiGetSupportingDocsStub.resolves(JSON.stringify({}));

      controller(req, res).then(() => {
        expect(res.render).to.have.been.called;
        expect(res.render).to.have.been.calledWith('app/garfile/review/index.njk', { cookie });
      });
    });
  });
});
