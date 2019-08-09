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
      });
    });

    it('should fail for empty port code', () => {
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
              new ValidationRule(validator.latitude, 'arrivalLat', undefined, 'Value entered is incorrect. Enter latitude to 4 decimal places'),
              new ValidationRule(validator.longitude, 'arrivalLong', undefined, 'Value entered is incorrect. Enter longitude to 4 decimal places'),
            ],
          });
        });
      });

      // TODO: Technically, if the port is NOT ZZZZ then there should not be a longitude or latitude
      // which is not actually represented in the code
      // it('should fail if port is not ZZZZ yet there is longitude and latitude', () => {
      //   const cookie = new CookieModel(req);

      //   sinon.stub(garApi, 'get').resolves(apiResponse);
      //   sinon.stub(garApi, 'patch');

      //   const callController = async () => {
      //     await controller(req, res);
      //   };

      //   callController().then(() => {
      //     expect(garApi.get).to.have.been.calledWith('ABCDEFGH');
      //     expect(garApi.patch).to.not.have.been.called;
      //     expect(res.render).to.have.been.calledWith('app/garfile/arrival/index', {
      //       cookie,
      //       errors: [
      // new ValidationRule(
      //    validator.latitude,
      //    'arrivalLat', undefined,
      //    'Value entered is incorrect. Enter latitude to 4 decimal places'),
      // new ValidationRule(
      //    validator.longitude,
      //    'arrivalLong', undefined,
      //    'Value entered is incorrect. Enter longitude to 4 decimal places'),
      //       ],
      //     });
      //   });
      // });
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
