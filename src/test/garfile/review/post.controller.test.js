/* eslint-disable no-underscore-dangle */
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
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const emailService = require('../../../common/services/sendEmail');
const { Manifest } = require('../../../common/models/Manifest.class');
const config = require('../../../common/config');

const controller = require('../../../app/garfile/review/post.controller');

describe('GAR Review Post Controller', () => {
  let req; let res;
  let garApiGetStub; let garApiGetPeopleStub; let garApiGetSupportingDocsStub; let garApiPatchStub;
  let sessionSaveStub;

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
          reference: '1234 4321 7890 0987',
        },
        u: {
          fn: 'Jim',
          e: 'captain@1701.net',
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
    garApiPatchStub = sinon.stub(garApi, 'patch');

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

  it('should inform user when GAR is submitted already', () => {
    garApiGetStub.resolves(JSON.stringify({
      status: {
        name: 'SUBMITTED',
      },
    }));
    garApiGetPeopleStub.resolves(JSON.stringify({
      items: [],
    }));
    garApiGetSupportingDocsStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(sessionSaveStub).to.have.been.called;
      expect(req.session.submiterrormessage).to.eql([{
        message: 'This GAR has already been submitted',
        identifier: '',
      }]);
      expect(res.redirect).to.have.been.calledWith('/garfile/review');
    });
  });

  it('should not submit GAR when validation errors', () => {
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
          new ValidationRule(validator.valuetrue, 'manifest', '', 'There must be at least one captain or crew member on the voyage'),
        ],
      });
    });
  });

  it('should not submit GAR when validation errors, with manifest issues', () => {
    const cookie = new CookieModel(req);
    sinon.stub(Manifest.prototype, 'validate').returns(false);
    garApiGetStub.resolves(JSON.stringify({
      status: {
        name: 'draft',
      },
    }));
    garApiGetPeopleStub.resolves(JSON.stringify({
      items: [{
        firstName: 'Richard',
        lastName: 'York',
      }],
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
          items: [{ firstName: 'Richard', lastName: 'York' }],
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
          new ValidationRule(validator.valuetrue, 'resolveError', '', 'Resolve manifest errors before submitting'),
          new ValidationRule(validator.valuetrue, 'manifest', '', 'There must be at least one captain or crew member on the voyage'),
        ],
      });
    });
  });

  describe('perform API call', () => {
    it('should go to failure if API rejects', () => {
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
      garApiGetSupportingDocsStub.resolves(JSON.stringify({}));
      garApiPatchStub.rejects('garApi.patch Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then().then()
        .then(() => {
          expect(res.render).to.have.been.calledWith('app/garfile/submit/failure/index', { cookie });
        });
    });

    it('should return an error if the API returns a message', () => {
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
      garApiGetSupportingDocsStub.resolves(JSON.stringify({}));
      garApiPatchStub.resolves(JSON.stringify({ message: 'GAR does not exist' }));
      sinon.stub(emailService, 'send').resolves();

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then().then(() => {
        cookie.setGarStatus('Submitted');
        expect(emailService.send).to.not.have.been.called;

        expect(sessionSaveStub).to.have.been.called;
        expect(req.session.submiterrormessage).to.eql([{
          message: 'An error has occurred. Try again later',
          identifier: '',
        }]);
        expect(res.redirect).to.have.been.calledWith('/garfile/review');
      });
    });

    it('sends email and goes to success page but adds message if mail service rejects', () => {
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
      garApiGetSupportingDocsStub.resolves(JSON.stringify({}));
      garApiPatchStub.resolves(JSON.stringify({}));
      sinon.stub(emailService, 'send').rejects('emailService.send Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then().then(() => {
        cookie.setGarStatus('Submitted');
        expect(emailService.send).to.have.been.called;
      })
        .then()
        .then(() => {
          expect(res.render).to.have.been.called;
          expect(res.render).to.have.been.calledWith('app/garfile/submit/success/index', {
            cookie,
            errors: [{ message: 'There was an issue sending a confirmation email, but the GAR should be submitted' }],
          });
        });
    });

    it('sends email and goes to success page', () => {
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
      garApiGetSupportingDocsStub.resolves(JSON.stringify({}));
      garApiPatchStub.resolves(JSON.stringify({}));
      sinon.stub(emailService, 'send').resolves();

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then().then(() => {
        cookie.setGarStatus('Submitted');
        expect(emailService.send).to.have.been.calledOnceWithExactly(config.NOTIFY_GAR_SUBMISSION_TEMPLATE_ID, 'captain@1701.net', { firstName: 'Jim', garId: '1234 4321 7890 0987' });
      })
        .then(() => {
          expect(res.render).to.have.been.called;
          expect(res.render).to.have.been.calledWith('app/garfile/submit/success/index', { cookie });
        });
    });

    it('sends email and goes to success page using UUID', () => {
      delete req.session.gar.reference;
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
      garApiGetSupportingDocsStub.resolves(JSON.stringify({}));
      garApiPatchStub.resolves(JSON.stringify({}));
      sinon.stub(emailService, 'send').resolves();

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then().then(() => {
        cookie.setGarStatus('Submitted');
        expect(emailService.send).to.have.been.calledOnceWithExactly(config.NOTIFY_GAR_SUBMISSION_TEMPLATE_ID, 'captain@1701.net', { firstName: 'Jim', garId: 'ABCDE' });
      })
        .then(() => {
          expect(res.render).to.have.been.called;
          expect(res.render).to.have.been.calledWith('app/garfile/submit/success/index', { cookie });
        });
    });
  });
});
