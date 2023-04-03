/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

const controller = require('../../../app/garfile/arrival/post.controller');

describe('Arrival Post Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        portChoice: 'No',
        arrivalPort: 'LHR',
        arrivalLat: '45.100000',
        arrivalDegrees: 45,
        arrivalMinutes: 6,
        arrivalSeconds: 0,
        arrivalLongDegrees: 12,
        arrivalLongMinutes: 5,
        arrivalLongSeconds: 60,
        arrivalLong: '12.100000',
        arrivalDay: '30',
        arrivalMonth: '5',
        arrivalYear: '2024',
        arrivalHour: '15',
        arrivalMinute: '00',
        arrivalLongDirection: 'E',
        arrivalLatDirection: 'N',

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

      await controller(req, res);

      expect(garApi.get).to.have.been.called;
      expect(garApi.patch).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/arrival/index', {
        cookie,
        errors: [new ValidationRule(validator.notEmpty, 'portChoice', undefined, 'Select whether the port code is known')],
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

    describe('port codes and co-ordinates', () => {
      it('should fail if port is ZZZZ and no longitude or latitude', () => {
        req.body.arrivalPort = 'ZZZZ';
        delete req.body.arrivalLong;
        delete req.body.arrivalLat;
        delete req.body.arrivalDegrees;
        delete req.body.arrivalMinutes;
        delete req.body.arrivalSeconds;
        delete req.body.arrivalLongDegrees;
        delete req.body.arrivalLongMinutes;
        delete req.body.arrivalLongSeconds;
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
              new ValidationRule(validator.latitude, 'arrivalLat', "NaN", 'Value entered is incorrect. Enter latitude to 6 decimal places'),
              new ValidationRule(validator.longitude, 'arrivalLong', "NaN", 'Value entered is incorrect. Enter longitude to 6 decimal places'),
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
      sinon.stub(garApi, 'patch').rejects('garApi.patch Example Reject');
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('ABCDEFGH');
        expect(garApi.patch).to.have.been.calledWith('ABCDEFGH', cookie.getGarStatus(), cookie.getGarArrivalVoyage());
        expect(res.render).to.have.been.calledWith('app/garfile/arrival/index', {
          cookie,
          errors: [{
            message: 'Failed to add to GAR',
          }],
        });
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
