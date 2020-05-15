const { expect } = require('chai');
const sanitiseValue = require('../public/javascripts/sanitise-value');

describe('Validator', () => {
  // input day tests
  it.only('Should remove the aphacharacters from string with input day', () => {
    const testValue = '1a';
    const type = 'day';

    const expected = '1';
    const actual = sanitiseValue(testValue, type);

    expect(expected).to.equal(actual);
  });

  it.only('Should allow 2 digits for the day', () => {
    const testValue = '234';
    const type = 'day';

    const expected = '23';
    const actual = sanitiseValue(testValue, type);

    expect(expected).to.equal(actual);
  });

  // input month tests
  it.only('Should remove the aphacharacters from string with input month', () => {
    const testValue = '3a';
    const type = 'month';

    const expected = '3';
    const actual = sanitiseValue(testValue, type);

    expect(expected).to.equal(actual);
  });

  it.only('Should allow 2 digits for the day', () => {
    const testValue = '200';
    const type = 'month';

    const expected = '20';
    const actual = sanitiseValue(testValue, type);

    expect(expected).to.equal(actual);
  });

  // input year tests
  it.only('Should remove the aphacharacters from string with input year', () => {
    const testValue = '2017aabbccddd';
    const type = 'year';

    const expected = '2017';
    const actual = sanitiseValue(testValue, type);

    expect(expected).to.equal(actual);
  });

  it.only('Should allow 4 digits for the year', () => {
    const testValue = '201689654';
    const type = 'year';

    const expected = '2016';
    const actual = sanitiseValue(testValue, type);

    expect(expected).to.equal(actual);
  });

  // input hour tests
  it.only('Should remove the aphacharacters from string with input hour', () => {
    const testValue = '15gregr';
    const type = 'hour';

    const expected = '15';
    const actual = sanitiseValue(testValue, type);

    expect(expected).to.equal(actual);
  });

  it.only('Should allow 2 digits for the hour', () => {
    const testValue = '4615';
    const type = 'hour';

    const expected = '46';
    const actual = sanitiseValue(testValue, type);

    expect(expected).to.equal(actual);
  });

  // input minute tests
  it.only('Should remove the aphacharacters from string with input minute', () => {
    const testValue = '42gregr';
    const type = 'minute';

    const expected = '42';
    const actual = sanitiseValue(testValue, type);

    expect(expected).to.equal(actual);
  });

  it.only('Should allow 2 digits for the minute', () => {
    const testValue = '52148';
    const type = 'minute';

    const expected = '52';
    const actual = sanitiseValue(testValue, type);

    expect(expected).to.equal(actual);
  });
});
