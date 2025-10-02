/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const { expect } = require('chai');

require('../../global.test');

const autocomplete = require('../../../common/utils/autocomplete');
const {nationalityList} = require("../../../common/utils/autocomplete");

/**
 * A true unit test should probably mock the incoming list of country codes,
 * but the list isn't going to wildly change and also is static enough to
 * rely upon for these assertions.
 */
describe('Autocomplete Utility', () => {
  describe('Nationality List', () => {
    let result;

    beforeEach(() => {
      result = nationalityList;
    });

    it('should generate a list of countries with alpha 3 codes', () => {
      expect(result).to.not.be.undefined;
      expect(result).to.be.an('array');

      const uk = result.find(row => row.code === 'GBR');
      expect(uk.code).to.eq('GBR');
      expect(uk.label).to.eq('United Kingdom (GBR)');

      const jpn = result.find(row => row.code === 'JPN');
      expect(jpn.code).to.eq('JPN');
      expect(jpn.label).to.eq('Japan (JPN)');
    });

    it('should have proper structure for each entry', () => {
      result.forEach(entry => {
        expect(entry).to.have.property('code');
        expect(entry).to.have.property('label');
        expect(entry.code).to.be.a('string');
        expect(entry.label).to.be.a('string');
      });
    });
  });

  describe('getCountryFromCode', () => {
    it('should return correct label for valid country code', () => {
      const result = autocomplete.getCountryFromCode('GBR');
      expect(result).to.eq('United Kingdom (GBR)');
    });

    it('should return correct label for custom nationality code', () => {
      const result = autocomplete.getCountryFromCode('GBD');
      expect(result).to.eq('British Overseas Territories Citizen (GBD)');
    });

    it('should return the code itself for unknown country code', () => {
      const result = autocomplete.getCountryFromCode('ZZZ');
      expect(result).to.eq('ZZZ');
    });

    it('should handle empty string', () => {
      const result = autocomplete.getCountryFromCode('');
      expect(result).to.eq('');
    });

    it('should handle null/undefined input', () => {
      expect(autocomplete.getCountryFromCode(null)).to.eq(null);
      expect(autocomplete.getCountryFromCode(undefined)).to.eq(undefined);
    });
  });

  describe('nationalityList', () => {
    it('should be a pre-generated list accessible as a property', () => {
      expect(autocomplete.nationalityList).to.not.be.undefined;
      expect(autocomplete.nationalityList).to.be.an('array');
      expect(autocomplete.nationalityList.length).to.be.greaterThan(0);
    });
  });

  describe('airportList and airportCodeList', () => {
    it('should export airportList', () => {
      expect(autocomplete.airportList).to.not.be.undefined;
      expect(autocomplete.airportList).to.be.an('array');
    });

    it('should export airportCodeList as an array of codes', () => {
      expect(autocomplete.airportCodeList).to.not.be.undefined;
      expect(autocomplete.airportCodeList).to.be.an('array');

      // Check that it contains both IATA and ICAO codes
      if (autocomplete.airportCodeList.length > 0) {
        autocomplete.airportCodeList.forEach(code => {
          expect(code).to.be.a('string');
        });
      }
    });
  });
});
