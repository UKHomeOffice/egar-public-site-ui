const { expect } = require('chai');

require('../../global.test');

const templateFilters = require('../../../common/utils/templateFilters');

// TODO: Uncamcelcase should frankly just use a library to perform the operation
describe('Template Filters Utility', () => {
  describe('uncamelcase', () => {
    it('should return empty string if number provided', () => {
      expect(templateFilters.uncamelCase(12345)).to.eq('');
    });

    it('should uncamelcase', () => {
      expect(templateFilters.uncamelCase('GetOranges')).to.eq('Get oranges');
      expect(templateFilters.uncamelCase('ShortTermVisit')).to.eq('Short term visit');
    });
  });
  describe('containsError', () => {
    let exampleArray;

    beforeEach(() => {
      exampleArray = [
        { identifier: 'firstName', message: 'Not important' },
        { identifier: 'surname', message: 'Does not matter' },
      ];
    });

    it('should return false if array is undefined', () => {
      expect(templateFilters.containsError(undefined, undefined)).to.be.false;
    });

    it('should return false if parameter is undefined', () => {
      expect(templateFilters.containsError([], undefined)).to.be.false;
      expect(templateFilters.containsError(exampleArray, undefined)).to.be.false;
    });

    it('should return false if not found', () => {
      expect(templateFilters.containsError(exampleArray, 'oranges')).to.be.false;
      expect(templateFilters.containsError(exampleArray, 'firstname')).to.be.false;
    });

    it('should return element if found', () => {
      expect(templateFilters.containsError(exampleArray, 'firstName')).to.deep.equal({
        text: 'Not important',
      });
      expect(templateFilters.containsError(exampleArray, 'surname')).to.deep.equal({
        text: 'Does not matter',
      });
    });
    it('should return truthy value if found', () => {
      expect(templateFilters.containsError(exampleArray, 'firstName')).to.be.ok;
      expect(templateFilters.containsError(exampleArray, 'surname')).to.be.ok;
    });
  });

  describe('formatGdsDate', () => {
    it('formats dates with a short or long month name', () => {
      expect(templateFilters.formatGdsDate('2026-12-11', 'short')).to.equal('11 Dec 2026');
      expect(templateFilters.formatGdsDate('2026-12-11', 'long')).to.equal('11 December 2026');
    });

    it('returns invalid or missing dates unchanged', () => {
      expect(templateFilters.formatGdsDate('not-a-date')).to.equal('not-a-date');
      expect(templateFilters.formatGdsDate(null)).to.equal(null);
    });
  });
});
