/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import garApi from '../../../common/services/garApi.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import controller from '../../../app/garfile/arrival/post.controller.js';
import i18n from 'i18n';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18n.configure({
  locales: ['en'],
  directory: path.join(__dirname, '../../../locales'),
  objectNotation: true,
  defaultLocale: 'en',
  register: global,
});

describe('Arrival Post Controller', () => {
  let req; let res;
  let clock;

  beforeEach(() => {
    chai.use(sinonChai);

    clock = sinon.useFakeTimers({
      now: new Date('2022-05-11 GMT'),
      shouldAdvanceTime: false,
      toFake: ["Date"],
    });

    req = {
      body: {
        portChoice: 'No',
        arrivalPort: 'LHR',
        arrivalLat: '45.100000',
        arrivalLong: '12.100000',
        arrivalDay: '30',
        arrivalMonth: '5',
        arrivalYear: '2022',
        arrivalHour: '15',
        arrivalMinute: '00',
      },
      session: {
        gar: {
          id: 'ABCDEFGH',
          voyageArrival: {},
          status: 'Draft',
        },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
    clock.restore();
  });

  describe('validation chains', () => {
    let apiResponse;

    beforeEach(() => {
      apiResponse = JSON.stringify({
        arrivalDate: '2012-30-05',
        arrivalTime: '15:00',
        arrivalPort: 'LHR',
        arrivalLong: '',
        arrivalLat: '',
        departurePort: 'BFS'
      });
    });

    it('should fail validation if no port choice selected', async () => {
      delete req.body.portChoice;

      const cookie = new CookieModel(req);

      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.called;
        expect(garApi.patch).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/arrival/index', {
          cookie,
          errors: [new ValidationRule(validator.notEmpty, 'portChoice', undefined, 'Select whether the port code is known')],
        });
      });

    });

    it('should fail for empty port code', () => {
      req.body.portChoice = 'Yes';
      req.body.arrivalPort = '';
      const cookie = new CookieModel(req);

      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('ABCDEFGH');
        expect(garApi.patch).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/garfile/arrival/index', {
          cookie,
          errors: [new ValidationRule(validator.notEmpty, 'arrivalPort', '', 'The arrival airport code must be entered')],
        });
      });
    });

    it('should fail if arrival date too far in the future', () => {
      req.body.arrivalYear = '2024';
      const cookie = new CookieModel(req);

      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('ABCDEFGH');
        expect(garApi.patch).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/garfile/arrival/index', {
          cookie,
          errors: [new ValidationRule(validator.dateNotMoreThanMonthInFuture, 'arrivalDate', { d: "30", m: "5", y: "2024" }, 'Arrival date must be in the future and within a month from now')],
        });
      });
    });

    it('should fail if arrival date in the past', () => {
      req.body.arrivalYear = '2010';
      const cookie = new CookieModel(req);

      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('ABCDEFGH');
        expect(garApi.patch).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/garfile/arrival/index', {
          cookie,
          errors: [new ValidationRule(validator.currentOrPastDate, 'arrivalDate', { d: "30", m: "5", y: "2010" }, 'Arrival date must be in the future and within a month from now')],
        });
      });
    });

    describe('port codes and co-ordinates', () => {
      it('should fail if port is ZZZZ and no longitude or latitude', () => {
        req.body.arrivalPort = 'ZZZZ';
        delete req.body.arrivalLong;
        delete req.body.arrivalLat;
        const cookie = new CookieModel(req);

        sinon.stub(garApi, 'get').resolves(apiResponse);
        sinon.stub(garApi, 'patch');

        const callController = async () => {
          await controller(req, res);
        };

        callController().then(() => {
          expect(garApi.get).to.have.been.calledWith('ABCDEFGH');
          expect(garApi.patch).to.not.have.been.called;
          expect(res.render).to.have.been.calledWith('app/garfile/arrival/index', {
            cookie,
            errors: [
              new ValidationRule(validator.latitude, 'arrivalLat', undefined, 'Value entered is incorrect. Enter latitude to 6 decimal places'),
              new ValidationRule(validator.longitude, 'arrivalLong', undefined, 'Value entered is incorrect. Enter longitude to 6 decimal places'),
            ],
          });
        });
      });
    });
  });

  describe('performAPICall', () => {
    let apiResponse;

    beforeEach(() => {
      apiResponse = JSON.stringify({
        arrivalDate: '2012-30-05',
        arrivalTime: '15:00',
        arrivalPort: 'LHR',
        arrivalLong: '',
        arrivalLat: '',
      });
    });

    it('should return an error message if api rejects', () => {
      const cookie = new CookieModel(req);
      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch').rejects('garApi.patch Example Reject', () => {
        expect(res.render).to.have.been.calledWith('app/garfile/arrival/index', {
          cookie,
          errors: [{
            message: 'Failed to add to GAR',
          }],
        });
      });

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('ABCDEFGH');
        expect(garApi.patch).to.have.been.calledWith('ABCDEFGH', cookie.getGarStatus(), cookie.getGarArrivalVoyage());
      });
    });

    it('should return the error message if one is returned from api', () => {
      const cookie = new CookieModel(req);
      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch').resolves(JSON.stringify({
        message: 'GAR does not exist',
      }));
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('ABCDEFGH');
        expect(garApi.patch).to.have.been.calledWith('ABCDEFGH', cookie.getGarStatus(), cookie.getGarArrivalVoyage());
        expect(res.render).to.have.been.calledWith('app/garfile/arrival/index', {
          cookie,
          errors: [{
            message: 'GAR does not exist',
          }],
        });
      });
    });

    // TODO:
    // Save and Continue currently goes to the next page, but it
    // should probably go to the craft page if going through the flow,
    // but back to the GAR view if going into specific sections.
    it('should go to the home page if no buttonClicked property', () => {
      const cookie = new CookieModel(req);
      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch').resolves(JSON.stringify({}));
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.body.buttonClicked).to.be.undefined;
        expect(garApi.get).to.have.been.calledWith('ABCDEFGH');
        expect(garApi.patch).to.have.been.calledWith('ABCDEFGH', cookie.getGarStatus(), cookie.getGarArrivalVoyage());
        expect(res.redirect).to.have.been.calledOnceWithExactly(307, '/garfile/view');
      });
    });

    it('should go to craft page if buttonClicked property is set', () => {
      req.body.buttonClicked = 'Save and continue';
      const cookie = new CookieModel(req);
      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch').resolves(JSON.stringify({}));
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('ABCDEFGH');
        expect(garApi.patch).to.have.been.calledWith('ABCDEFGH', cookie.getGarStatus(), cookie.getGarArrivalVoyage());
        expect(res.redirect).to.have.been.calledWith('/garfile/craft');
      });
    });
  });
});
