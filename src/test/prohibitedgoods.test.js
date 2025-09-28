/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';

import nock from 'nock';
import './global.test.js';
import garApi from '../common/services/garApi.js';
import endpoints from '../common/config/endpoints.js';

const BASE_URL = endpoints.baseUrl();
const garId = 'c2d86db6-006c-4f5e-9e22-e039c8b1ddc7';

const garProhibitedGoodsPartial = {
  status: 'Draft',
  prohibitedGoods: 'True',
};

describe('ProhibitedGoods', () => {
  beforeEach(() => {
    nock(BASE_URL)
      .patch(`/gar/${garId}`, garProhibitedGoodsPartial)
      .reply(200, {
        status: { name: 'Draft' },
      });
  });

  it('Should update the GARs prohibited goods detail', (done) => {
    garApi.patch(garId, 'Draft', garProhibitedGoodsPartial)
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.have.keys(['status']);
        expect(parsedResponse.status).to.have.keys(['name']);
        done();
      });
  });
});
