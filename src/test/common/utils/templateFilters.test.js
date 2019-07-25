/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

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
});
