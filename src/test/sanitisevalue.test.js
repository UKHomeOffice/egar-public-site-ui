const { expect } = require('chai');

require('./global.test');

const sanitiseValue = require('../public/javascripts/sanitisevalue');

describe('Sanitise value tests', () => {
  let testValue;
  let type;
  let expectedResult;
  let actualResult;


  beforeEach(() => {
    testValue = '';
    type = '';

    expectedResult = '';
    actualResult = '';
  });

  // input day tests
  it('Should remove the aphacharacters from string with input day', () => {
    testValue = '1a';
    type = 'day';

    expectedResult = '1';
    actualResult = sanitiseValue(testValue, type);

    expect(expectedResult).to.equal(actualResult);
  });

  it('Should allow 2 digits for the day', () => {
    testValue = '234';
    type = 'day';

    expectedResult = '23';
    actualResult = sanitiseValue(testValue, type);

    expect(expectedResult).to.equal(actualResult);
  });

  // input month tests
  it('Should remove the aphacharacters from string with input month', () => {
    testValue = '3a';
    type = 'month';

    expectedResult = '3';
    actualResult = sanitiseValue(testValue, type);

    expect(expectedResult).to.equal(actualResult);
  });

  it('Should allow 2 digits for the day', () => {
    testValue = '200';
    type = 'month';

    expectedResult = '20';
    actualResult = sanitiseValue(testValue, type);

    expect(expectedResult).to.equal(actualResult);
  });

  // input year tests
  it('Should remove the aphacharacters from string with input year', () => {
    testValue = '2017aabbccddd';
    type = 'year';

    expectedResult = '2017';
    actualResult = sanitiseValue(testValue, type);

    expect(expectedResult).to.equal(actualResult);
  });

  it('Should allow 4 digits for the year', () => {
    testValue = '201689654';
    type = 'year';

    expectedResult = '2016';
    actualResult = sanitiseValue(testValue, type);

    expect(expectedResult).to.equal(actualResult);
  });

  // input hour tests
  it('Should remove the aphacharacters from string with input hour', () => {
    testValue = '15gregr';
    type = 'hour';

    expectedResult = '15';
    actualResult = sanitiseValue(testValue, type);

    expect(expectedResult).to.equal(actualResult);
  });

  it('Should allow 2 digits for the hour', () => {
    testValue = '4615';
    type = 'hour';

    expectedResult = '46';
    actualResult = sanitiseValue(testValue, type);

    expect(expectedResult).to.equal(actualResult);
  });

  // input minute tests
  it('Should remove the aphacharacters from string with input minute', () => {
    testValue = '42gregr';
    type = 'minute';

    expectedResult = '42';
    actualResult = sanitiseValue(testValue, type);

    expect(expectedResult).to.equal(actualResult);
  });

  it('Should allow 2 digits for the minute', () => {
    testValue = '52148';
    type = 'minute';

    expectedResult = '52';
    actualResult = sanitiseValue(testValue, type);

    expect(expectedResult).to.equal(actualResult);
  });
});
