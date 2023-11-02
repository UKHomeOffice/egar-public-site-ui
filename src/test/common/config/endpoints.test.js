/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const { expect } = require('chai');

require('../../global.test');

const endpoints = require('../../../common/config/endpoints');

describe('Endpoint Tests', () => {
  it('should encode email addresses with plus signs correctly', () => {

    const userSearchEndpoint = endpoints.userSearch('perftestuser1cerbeus+001@gmail.com');

    expect(userSearchEndpoint).to.equal('http://localhost:5000/v0.2.0/user/search?email=perftestuser1cerbeus%2B001%40gmail.com');

    
    // const result = autocomplete.generateCountryList();
    // expect(result).to.not.be.undefined;

    // const uk = result.find(row => row.code === 'GBR');
    // expect(uk.code).to.eq('GBR');
    // expect(uk.label).to.eq('United Kingdom (GBR)');

    // const jpn = result.find(row => row.code === 'JPN');
    // expect(jpn.code).to.eq('JPN');
    // expect(jpn.label).to.eq('Japan (JPN)');
  });
});
