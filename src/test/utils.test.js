const { expect } = require('chai');
const sinon = require('sinon');

require('./global.test');

const utilFunctions = require('../common/utils/utils');

describe('Duration before departure', () => {
  afterEach(() => sinon.restore());

  it('returns the rounded minutes until departure using local time', () => {
    sinon.useFakeTimers({ now: new Date(2023, 3, 11, 12, 0, 20), toFake: ['Date'] });

    expect(utilFunctions.getDurationBeforeDeparture('2023-04-11', '14:05:00')).to.equal(125);
  });

  it('returns negative minutes for a past departure', () => {
    sinon.useFakeTimers({ now: new Date(2023, 3, 11, 12), toFake: ['Date'] });

    expect(utilFunctions.getDurationBeforeDeparture('2023-04-11', '11:45:00')).to.equal(-15);
  });
});

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
