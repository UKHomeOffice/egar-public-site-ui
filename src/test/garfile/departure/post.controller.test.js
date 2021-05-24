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

const controller = require('../../../app/garfile/departure/post.controller');

describe('Departure Post Controller', () => {
  let req; let res; let apiResponse;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        portChoice: 'No',
        departurePort: 'ZZZZ',
        departureLat: '45.1000',
        departureLong: '12.1000',
        departureDay: '30',
        departureMonth: '5',
        departureYear: '2022',
        departureHour: '15',
        departureMinute: '00',
      },
      session: {
        gar: {
          id: '12345',
          voyageDeparture: {},
          status: 'Draft',
        },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    apiResponse = JSON.stringify({
      departureDate: '2012-30-05',
      departureTime: '15:00',
      departurePort: 'LHR',
      departureLong: '',
      departureLat: '',
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should fail validation if no port choice selected', async () => {
    delete req.body.portChoice;

    const cookie = new CookieModel(req);

    sinon.stub(garApi, 'get').resolves(apiResponse);
    sinon.stub(garApi, 'patch');

    await controller(req, res);

    expect(garApi.get).to.have.been.called;
    expect(garApi.patch).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/departure/index', {
      cookie,
      errors: [new ValidationRule(validator.notEmpty, 'portChoice', undefined, 'Select whether the port code is known')],
    });
  });

  describe('port codes and co-ordinates', () => {
    it('should fail if port is known but not actually entered', () => {
      req.body.portChoice = 'Yes';
      delete req.body.departurePort;
      delete req.body.departureLong;
      delete req.body.departureLat;
      const cookie = new CookieModel(req);

      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledOnceWithExactly('12345');
        expect(garApi.patch).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/departure/index', {
          cookie,
          errors: [
            new ValidationRule(validator.notEmpty, 'departurePort', '', 'The departure airport code must be entered'),
          ],
        });
      });
    });

    it('should fail if port is known but not actually entered', () => {
      // Covers the scenario where the port code is not 'YYYY' but no choice was made,
      // contrived as it should not be possible via the front end.
      delete req.body.portChoice;
      delete req.body.departurePort;
      delete req.body.departureLong;
      delete req.body.departureLat;
      const cookie = new CookieModel(req);

      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledOnceWithExactly('12345');
        expect(garApi.patch).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/departure/index', {
          cookie,
          errors: [
            new ValidationRule(validator.notEmpty, 'portChoice', undefined, 'Select whether the port code is known'),
          ],
        });
      });
    });

    it('should fail if port is ZZZZ and no longitude or latitude', () => {
      req.body.departurePort = 'ZZZZ';
      delete req.body.departureLong;
      delete req.body.departureLat;
      const cookie = new CookieModel(req);

      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('12345');
        expect(garApi.patch).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/garfile/departure/index', {
          cookie,
          errors: [
            new ValidationRule(validator.latitude, 'departureLat', undefined, 'Value entered is incorrect. Enter latitude to 4 decimal places'),
            new ValidationRule(validator.longitude, 'departureLong', undefined, 'Value entered is incorrect. Enter longitude to 4 decimal places'),
          ],
        });
      });
    });

    it('should fail if port is YYYY and no longitude or latitude', () => {
      req.body.portChoice = 'No';
      req.body.departurePort = 'YYYY';
      delete req.body.departureLong;
      delete req.body.departureLat;
      const cookie = new CookieModel(req);

      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('12345');
        expect(garApi.patch).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/garfile/departure/index', {
          cookie,
          errors: [
            new ValidationRule(validator.latitude, 'departureLat', undefined, 'Value entered is incorrect. Enter latitude to 4 decimal places'),
            new ValidationRule(validator.longitude, 'departureLong', undefined, 'Value entered is incorrect. Enter longitude to 4 decimal places'),
          ],
        });
      });
    });
  });

  describe('performAPICall', () => {
    it('should return an error message if api rejects', () => {
      const cookie = new CookieModel(req);
      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch').rejects('garApi.patch Example Reject');
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('12345');
        expect(garApi.patch).to.have.been.calledWith('12345', cookie.getGarStatus(), cookie.getGarDepartureVoyage());
        expect(res.render).to.have.been.calledWith('app/garfile/departure/index', {
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
        expect(garApi.get).to.have.been.calledWith('12345');
        expect(garApi.patch).to.have.been.calledWith('12345', cookie.getGarStatus(), cookie.getGarDepartureVoyage());
        expect(res.render).to.have.been.calledWith('app/garfile/departure/index', {
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
        expect(garApi.get).to.have.been.calledWith('12345');
        expect(garApi.patch).to.have.been.calledWith('12345', cookie.getGarStatus(), cookie.getGarDepartureVoyage());
        expect(res.redirect).to.have.been.calledOnceWithExactly(307, '/garfile/view');
      });
    });

    it('should go to arrival page if buttonClicked property is set', () => {
      req.body.buttonClicked = 'Save and continue';
      const cookie = new CookieModel(req);
      sinon.stub(garApi, 'get').resolves(apiResponse);
      sinon.stub(garApi, 'patch').resolves(JSON.stringify({}));
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApi.get).to.have.been.calledWith('12345');
        expect(garApi.patch).to.have.been.calledWith('12345', cookie.getGarStatus(), cookie.getGarDepartureVoyage());
        expect(res.redirect).to.have.been.calledWith('/garfile/arrival');
      });
    });
  });
});
