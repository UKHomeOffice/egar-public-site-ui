const sinon = require('sinon');
const expect = require('chai').expect;
const chai = require('chai');
const sinonChai = require('sinon-chai');

const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');

const controller = require('../../../app/garfile/departure/post.controller');

describe('Departure Post Controller', () => {
  let req, res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example request and response objects with appropriate spies
    req = {
      body: {
        departureDate: null,
        departurePort: 'ZZZZ',
      },
      session: {
        gar: {
          id: 12345,
          voyageDeparture: {
            departureDay: 6,
            departureMonth: 6,
            departureYear: 2019,
          },
        },
      }
    };

    res = {
      render: sinon.spy(),
    };

    // Stub APIs, in this case, GAR API
    sinon.stub(garApi, 'get').callsFake((garId) => {
      logger.info('Stubbed garApi get method called');
      logger.info('garId: ' + garId);
      return Promise.resolve(JSON.stringify(req.session.gar));
    });

    sinon.stub(garApi, 'patch').callsFake((garId, status, partial) => {
      logger.info('Stubbed garApi patch method called');
      logger.info('garId: ' + garId);
      logger.info('status: ' + status);
      logger.info('partial: ' + partial);
      return Promise.resolve();
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should fail validation on basic submit', async() => {
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/garfile/departure/index');
  });
});
