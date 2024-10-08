/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const nock = require('nock');

require('./global.test');
const garApi = require('../common/services/garApi');
const endpoints = require('../common/config/endpoints');

const garId = 'c2d86db6-006c-4f5e-9e22-e039c8b1ddc7';
const BASE_URL = endpoints.baseUrl();

const garResponsiblePersonPartial = {
  status: 'Draft',
  responsibleGivenName: 'Joe',
  responsibleSurname: 'Pike',
  responsibleContactNo: '08078953493',
  responsibleEmail: 'fake@test.com',
  responsibleAddressLine1: 'Buckingham Palace',
  responsibleAddressLine2: 'Buckingham Palace Road',
  responsibleTown: 'London',
  responsiblePostcode: 'SW111A',
  responsibleCountry: 'GBR',
  fixedBasedOperator: 'Captain',
  fixedBasedOperatorAnswer: ''
};

describe('ResponsiblePerson', () => {
  beforeEach(() => {
    nock(BASE_URL)
      .patch(`/gar/${garId}`, garResponsiblePersonPartial)
      .reply(200, {
        status: { name: 'Draft' },
      });
  });

  it('Should update the GARs responsible person details', (done) => {
    garApi.patch(garId, 'Draft', garResponsiblePersonPartial)
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.have.keys(['status']);
        expect(parsedResponse.status).to.have.keys(['name']);
        done();
      });
  });
});
