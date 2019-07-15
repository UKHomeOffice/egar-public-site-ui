/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const prohibitedGoodsOptions = require('../../../common/seeddata/egar_prohibited_goods_options');
const reasonForVisitOptions = require('../../../common/seeddata/egar_visit_reason_options.json');
const freeCirculationOptions = require('../../../common/seeddata/egar_craft_eu_free_circulation_options.json');

const controller = require('../../../app/garfile/customs/get.controller');

describe('GAR Customs Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    // Example request and response objects with appropriate spies
    req = {
      session: {
        gar: { id: 'ABC123' },
      },
    };
    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with an error message if api rejects', () => {
    sinon.stub(garApi, 'get').rejects('garApi.get Example Reject');
    cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.get).to.have.been.calledWith('ABC123');
      expect(res.render).to.have.been.calledWith('app/garfile/customs/index', {
        cookie,
        freeCirculationOptions,
        reasonForVisitOptions,
        prohibitedGoodsOptions,
        errors: [{ message: 'Problems retrieving GAR' }],
      });
    });
  });

  it('should render the appropriate page', async () => {
    sinon.stub(garApi, 'get').resolves(JSON.stringify({
      id: 'GAR1-ID',
    }));
    const cookie = new CookieModel(req);

    await controller(req, res);

    expect(garApi.get).to.have.been.calledWith('ABC123');
    expect(res.render).to.have.been.calledWith('app/garfile/customs/index', {
      cookie,
      freeCirculationOptions,
      reasonForVisitOptions,
      prohibitedGoodsOptions,
      gar: {
        id: 'GAR1-ID',
      },
    });
  });
});
