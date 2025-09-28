/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import garApi from '../../../common/services/garApi.js';
import prohibitedGoodsOptions from '../../../common/seeddata/egar_prohibited_goods_options.json' with { type: "json"};
import reasonForVisitOptions from '../../../common/seeddata/egar_visit_reason_options.json' with { type: "json"};
import freeCirculationOptions from '../../../common/seeddata/egar_craft_eu_free_circulation_options.json' with { type: "json"};
import baggageOptions from '../../../common/seeddata/egar_baggage_options.json' with { type: "json"};
import intentionValueOptions from '../../../common/seeddata/egar_intention_value_options.json' with { type: "json"};
import continentalShelfOptions from '../../../common/seeddata/egar_continental_shelf_options.json' with { type: "json"};
import controller from '../../../app/garfile/customs/get.controller.js';

describe('GAR Customs Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

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
        baggageOptions,
        intentionValueOptions,
        continentalShelfOptions,
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
      baggageOptions,
      intentionValueOptions,
      continentalShelfOptions,
      gar: {
        id: 'GAR1-ID',
      },
    });
  });
});
