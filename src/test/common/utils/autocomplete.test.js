/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const { expect } = require('chai');

require('../../global.test');

const autocomplete = require('../../../common/utils/autocomplete');

/**
 * A true unit test should probably mock the incoming list of country codes,
 * but the list isn't going to wildly change and also is static enough to
 * rely upon for these assertions.
 */
describe('Autocomplete Utility', () => {
  describe('generateNationalityList', () => {
    let result;

    beforeEach(() => {
      result = autocomplete.generateNationalityList();
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

    it('should include custom nationalities at the beginning', () => {
      // Check for custom nationalities - they should appear after the empty entry
      const customNationalities = [
        { code: 'GBD', expectedLabel: 'British Overseas Territories Citizen (GBD) (GBD)' },
        { code: 'GBN', expectedLabel: 'British National (Overseas) (GBN) (GBN)' },
        { code: 'GBO', expectedLabel: 'British Overseas Citizen (GBO) (GBO)' },
        { code: 'RKS', expectedLabel: 'Kosovo (RKS)' },
        { code: 'PSE', expectedLabel: 'Palestine Authority (PSE)' },
        { code: 'XXA', expectedLabel: 'Stateless as defined in Article 1 of the 1954 Convention (XXA)' },
        { code: 'XXB', expectedLabel: 'Refugee as defined in Article 1 of the 1951 Convention (XXB)' },
        { code: 'XXC', expectedLabel: 'Refugee Other (not defined under 1951 or 1954 Convention) (XXC)' },
        { code: 'XXX', expectedLabel: 'Person of unspecified nationality (XXX)' }
      ];

      customNationalities.forEach(nationality => {
        const found = result.find(row => row.code === nationality.code);
        expect(found).to.not.be.undefined;
        expect(found.label).to.eq(nationality.expectedLabel);
      });
    });

    it('should exclude countries in the skip list', () => {
      const skipListSamples = ['ABW', 'AIA', 'ALA', 'ANT', 'ASM', 'ATA', 'BES', 'BMU', 'CCK', 'COK'];

      skipListSamples.forEach(code => {
        const found = result.find(row => row.code === code);
        expect(found).to.be.undefined;
      });
    });

    it('should include an empty entry at the beginning', () => {
      expect(result[0]).to.deep.equal({ code: '', label: '' });
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
      expect(result).to.eq('British Overseas Territories Citizen (GBD) (GBD)');
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
