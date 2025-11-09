/* eslint-env mocha */

const { expect } = require('chai');

require('./global.test');

const utilFunctions = require('../common/utils/utils');

describe('Decimal truncation tests', () => {
  it('should truncate long decimal to four places', () => {
    expect(utilFunctions.trimToDecimalPlaces('1.1234567', 4)).to.equal('1.1234');
  });

  it('should not truncate if supplied decimal places fewer than allowed', () => {
    expect(utilFunctions.trimToDecimalPlaces('1.123', 4)).to.equal('1.123');
  });

  it('should ensure negative values remain negative', () => {
    expect(utilFunctions.trimToDecimalPlaces('-1.123', 4)).to.equal('-1.123');
  });

  it('should return values with no decimal place unchanged', () => {
    expect(utilFunctions.trimToDecimalPlaces('180', 4)).to.equal('180');
  });

  it('should trim leading whitespace', () => {
    expect(utilFunctions.trimToDecimalPlaces(' 180.132', 4)).to.equal('180.132');
  });

  it('should trim trailing whitespace', () => {
    expect(utilFunctions.trimToDecimalPlaces('180.13244 ', 4)).to.equal('180.1324');
  });
});
