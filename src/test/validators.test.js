/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const expect = require('chai').expect;
const chai = require('chai');
const should = chai.should();
const validator = require('../common/utils/validator');
const validationRules = require('../common/models/ValidationRule.class');

function genPortObj(portCode, lat, long) {
  return {
    portCode,
    lat,
    long
  };
}

function genDateObj(d, m, y) {
  return {
    d,
    m,
    y
  };
}

function genTimeObj(h, m) {
  return {
    h,
    m
  };
}

describe('Validator', () => {
  it('Should return false when fields are empty', () => {
    expect(validator.notEmpty(null)).to.be.false;
    expect(validator.notEmpty(undefined)).to.be.false;
    expect(validator.notEmpty('')).to.be.false;
  });

  it('Should return true when a field is not empty', () => {
    expect(validator.notEmpty('Hello')).to.be.true;
  });

  it('Should validate truth', () => {
    expect(validator.valuetrue(true)).to.be.true;
  });

  it('Should not validate false', () => {
    expect(validator.valuetrue(false)).to.be.false;
  });

  it('Should successfully reject a password under 6 chars', () => {
    expect(validator.passwordCheck('hello')).to.be.false;
  });

  it('Should successfully accept a password over 12 chars', () => {
    expect(validator.passwordCheck('hellouvuvuuvuvuvuvuvuv')).to.be.true;
  });

  it('Should return true when two password match', () => {
    expect(validator.confirmPassword('123', '123')).to.be.true;
  });

  it('Should return false when two password do not match', () => {
    expect(validator.confirmPassword('123', '321')).to.be.false;
  });

  it('Should return false if special symbols exist', () => {
    expect(validator.onlySymbols('!@£!$')).to.be.false;
  });

  it('Should return true if no special symbols exist', () => {
    expect(validator.onlySymbols('HelloWrold123')).to.be.true;
  });

  it('Should return true if an email consists of a valid structure', () => {
    expect(validator.email('helloWorld@gmail.com')).to.be.true;
  });

  it('Should return false if an email consists of an invalid structure', () => {
    expect(validator.email('adasdagmail.com')).to.be.false;
  });

  it('Should return true for a valid numeric day', () => {
    expect(validator.validDay('22', '12', '1999')).to.be.true;
    expect(validator.validDay('31', '12', '1999')).to.be.true;
    expect(validator.validDay('01', '01', '1999')).to.be.true;
    expect(validator.validDay('12', '11', '1920')).to.be.true;
  });

  it('Should return false for an invalid numeric day', () => {
    expect(validator.validDay('32', '12', '1999')).to.be.false;
    expect(validator.validDay('-1', '12', '1999')).to.be.false;
    expect(validator.validDay('aa', '01', '1999')).to.be.false;
  });

  it('Should return true for a valid numeric month', () => {
    expect(validator.validMonth('12')).to.be.true;
    expect(validator.validMonth('11')).to.be.true;
    expect(validator.validMonth('01')).to.be.true;
  });

  it('Should return false for an invalid numeric month', () => {
    expect(validator.validMonth('-1')).to.be.false;
    expect(validator.validMonth('13')).to.be.false;
    expect(validator.validMonth('aa')).to.be.false;
  });

  it('Should return true for a valid year greater than or equal to the current year', () => {
    expect(validator.validYear('2025')).to.be.true;
  });

  it('Should return false for a year not consisting of 4 characters', () => {
    expect(validator.validYear('20')).to.be.false;
    expect(validator.validYear('20200202')).to.be.false;
  });

  it('Should return true for real dates', () => {
    expect(validator.realDate(genDateObj('22', '12', '2050'))).to.be.true;
    expect(validator.realDate(genDateObj('01', '02', '2025'))).to.be.true;
  });

  it('Should return false for invalid dates', () => {
    expect(validator.realDate(genDateObj('aa', 'bb', 'cccc'))).to.be.false;
    expect(validator.realDate(genDateObj('1f', 'd2', '20S5'))).to.be.false;
  });

  it('Should return true for a date greater than today', () => {
    const currDate = new Date();
    const day = currDate.getDate();
    const month = currDate.getMonth() + 1;
    const year = currDate.getFullYear();
    expect(validator.currentOrFutureDate(genDateObj(day, month, year))).to.be.true;
    expect(validator.currentOrFutureDate(genDateObj('22', '12', '2055'))).to.be.true;
    expect(validator.currentOrFutureDate(genDateObj('01', '01', '2020'))).to.be.true;
  });

  it('Should return false for a date before today', () => {
    const currDate = new Date();
    const day = currDate.getDate() - 1;
    const month = currDate.getMonth() + 1;
    const year = currDate.getFullYear();
    expect(validator.currentOrFutureDate(genDateObj(day, month, year))).to.be.false;
    expect(validator.currentOrFutureDate(genDateObj('22', '12', '1999'))).to.be.false;
  });

  it('Should return true for valid times', () => {
    expect(validator.validTime(genTimeObj('15', '30'))).to.be.true;
    expect(validator.validTime(genTimeObj('23', '59'))).to.be.true;
    expect(validator.validTime(genTimeObj('00', '01'))).to.be.true;
  });

  it('Should return false for invalid times', () => {
    expect(validator.validTime(genTimeObj('15', '60'))).to.be.false;
    expect(validator.validTime(genTimeObj('24', '00'))).to.be.false;
    expect(validator.validTime(genTimeObj('00', '61'))).to.be.false;
  });

  it('Should generate an array of 2 validationRules', () => {
    const validationArr = validator.genValidations(validator.notEmpty, ['1', '2'], ['1', '2'], ['1', '2']);
    expect(validationArr).to.be.an('array');
    for (let i = 0; i < validationArr.length; i++) {
      expect(validationArr[i]).to.be.an('array');
    }
    expect(validationArr).to.have.length(2);
  });

  it('Should return true when ZZZZ is entered as a port alongside lat and long coords', () => {
    expect(validator.validatePortCoords(genPortObj('ZZZZ', '28.120439', '-7.077516'))).to.be.true;
  });

  it('Should return true when a valid pord is entered without lat and long coords', () => {
    expect(validator.validatePortCoords(genPortObj('FRN', '', ''))).to.be.true;
  });

  it('Should return true when a valid pord is entered without lat and long coords', () => {
    expect(validator.validatePortCoords(genPortObj('FRN', '', ''))).to.be.true;
  });

  it('Should return true when a valid pord is entered with lat and long coords', () => {
    expect(validator.validatePortCoords(genPortObj('FRN', '28.120439', '-7.077516'))).to.be.true;
  });

  it('Should return false when a ZZZZ is entered as a port without lat and long coords', () => {
    expect(validator.validatePortCoords(genPortObj('ZZZZ', '', ''))).to.be.false;
  });

  it('Should validate a chain of rules', () => {
    const validationArr = validator.genValidations(validator.notEmpty, ['1', '2'], ['1', '2'], ['1', '2']);
    validator.validateChains(validationArr)
      .then(() => {
        expect(true).to.be.true;
      })
      .catch(() => {
        expect(true).to.be.false;
      });
  });

  it('Should reject a chain of rules containing validation errors', () => {
    const validationArr = validator.genValidations(validator.notEmpty, ['1', '2'], ['1', ''], ['1', '2']);
    validator.validateChains(validationArr)
      .then(() => {
        expect(false).to.be.true;
      })
      .catch(() => {
        expect(true).to.be.true;
      });
  });

  it('Should return true when a + and min 5 max 20 digits no spaces', () => {
    expect(validator.validIntlPhone('+12345')).to.be.true;
    expect(validator.validIntlPhone('+1234544')).to.be.true;
    expect(validator.validIntlPhone('+12233445566778899112')).to.be.true;
  });

  it('Should return false when a no + and less than 5 max more than 20 digits  spaces', () => {
    expect(validator.validIntlPhone('12345')).to.be.false;
    expect(validator.validIntlPhone('+1234')).to.be.false;
    expect(validator.validIntlPhone('+122334455667788991123')).to.be.false;
    expect(validator.validIntlPhone('+1234 5')).to.be.false;

  // Latitude tests
  it('Should return true for a valid lattitude - 4 dp', () => {
    expect(validator.lattitude('51.9576')).to.be.true;
    expect(validator.lattitude('1.9576')).to.be.true;
    expect(validator.lattitude('-51.9576')).to.be.true;
    expect(validator.lattitude('90.0000')).to.be.true;
    expect(validator.lattitude('-90.0000')).to.be.true;
  });

  it('Should return false for an invalid lattitude - 4 dp', () => {
    expect(validator.lattitude('51.95377')).to.be.false;
    expect(validator.lattitude('51.953')).to.be.false;
    expect(validator.lattitude('51.95')).to.be.false;
    expect(validator.lattitude('51.9')).to.be.false;
    expect(validator.lattitude('51')).to.be.false;
    expect(validator.lattitude('90.0001')).to.be.false;
    expect(validator.lattitude('-90.0001')).to.be.false;
  });

  // Longitude tests
  it('Should return true for a valid longitude - 4 dp', () => {
    expect(validator.longitude('-1.2456')).to.be.true;
    expect(validator.longitude('1.9576')).to.be.true;
    expect(validator.longitude('12.9576')).to.be.true;
    expect(validator.longitude('180.0000')).to.be.true;
    expect(validator.longitude('-180.0000')).to.be.true;
  });

  it('Should return false for an invalid longitude - 4 dp', () => {
    expect(validator.longitude('-1.24563')).to.be.false;
    expect(validator.longitude('-1.245')).to.be.false;
    expect(validator.longitude('-1.24')).to.be.false;
    expect(validator.longitude('-1.2')).to.be.false;
    expect(validator.longitude('-1.')).to.be.false;
    expect(validator.longitude('-1')).to.be.false;
    expect(validator.longitude('181.0001')).to.be.false;
    expect(validator.longitude('-180.0001')).to.be.false;
  });
});
