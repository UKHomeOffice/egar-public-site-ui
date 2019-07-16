/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');

const validator = require('../common/utils/validator');

function genPortObj(portCode, lat, long) {
  return {
    portCode,
    lat,
    long,
  };
}

function genDateObj(d, m, y) {
  return {
    d,
    m,
    y,
  };
}

function genTimeObj(h, m) {
  return {
    h,
    m,
  };
}

describe('Validator', () => {
  it('Should return false when numeric inputs are not', () => {
    expect(validator.isNumeric('aa')).to.be.false;
    expect(validator.isNumeric('true')).to.be.false;
  });

  it('Should return true when numeric inputs are input', () => {
    expect(validator.isNumeric('12')).to.be.true;
    expect(validator.isNumeric('31')).to.be.true;
  });

  it('Should return false when fields are empty', () => {
    expect(validator.notEmpty(null)).to.be.false;
    expect(validator.notEmpty(undefined)).to.be.false;
    expect(validator.notEmpty('')).to.be.false;
  });

  it('Should return false when fields have symbols or spaces at the start', () => {
    expect(validator.notEmpty('     still invalid')).to.be.false;
    expect(validator.notEmpty('!@£$%^&*')).to.be.false;
    expect(validator.notEmpty(' still not valid')).to.be.false;
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
    expect(validator.validDay('!!!', '01', '1999')).to.be.false;
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
    expect(validator.realDate(null)).to.be.false;
    expect(validator.realDate(undefined)).to.be.false;
    expect(validator.realDate(genDateObj('aa', 'bb', 'cccc'))).to.be.false;
    expect(validator.realDate(genDateObj('1f', 'd2', '20S5'))).to.be.false;
  });

  it('Should return true for a date greater than today', () => {
    const clock = sinon.useFakeTimers(new Date(2011, 9, 2).getTime());

    const currDate = new Date();
    const day = currDate.getDate();
    const nextDay = day + 1;
    const month = currDate.getMonth();
    const nextMonth = currDate.getMonth() + 1;
    const year = currDate.getFullYear();
    const nextYear = currDate.getFullYear() + 1;
    expect(validator.currentOrFutureDate(genDateObj(day, nextMonth, year))).to.be.true;
    expect(validator.currentOrFutureDate(genDateObj(day, nextMonth, nextYear))).to.be.true;
    expect(validator.currentOrFutureDate(genDateObj(nextDay, month, nextYear))).to.be.true;
    expect(validator.currentOrFutureDate(genDateObj('22', '12', '2055'))).to.be.true;
    expect(validator.currentOrFutureDate(genDateObj('01', '01', '2020'))).to.be.true;

    clock.restore();
  });

  it('Should return true for a date after, edge cases', () => {
    const clock = sinon.useFakeTimers(new Date(2011, 11, 31).getTime());

    expect(validator.currentOrFutureDate(genDateObj(1, 1, 2011))).to.be.false;
    expect(validator.currentOrFutureDate(genDateObj(31, 1, 2011))).to.be.false;
    expect(validator.currentOrFutureDate(genDateObj(1, 1, 2012))).to.be.true;
    expect(validator.currentOrFutureDate(genDateObj(31, 12, 2011))).to.be.true;

    clock.restore();
  });

  it('Should return false for a date before today', () => {
    const clock = sinon.useFakeTimers(new Date(2011, 12, 31).getTime());

    const currDate = new Date();
    const day = currDate.getDate() - 1;
    const month = currDate.getMonth() + 1;
    const previousMonth = currDate.getMonth() - 1;
    const year = currDate.getFullYear();
    expect(validator.currentOrFutureDate(genDateObj(day, month, year))).to.be.false;
    expect(validator.currentOrFutureDate(genDateObj(currDate.getDate(), previousMonth, year))).to.be.false;
    expect(validator.currentOrFutureDate(genDateObj('22', '12', '1999'))).to.be.false;

    clock.restore();
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
    for (let i = 0; i < validationArr.length; i += 1) {
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

  it('Should validate a 3 char length ISO country code', () => {
    expect(validator.validISOCountryLength('ZAF')).to.be.true;
    expect(validator.validISOCountryLength('')).to.be.false;
    expect(validator.validISOCountryLength(undefined)).to.be.false;
    expect(validator.validISOCountryLength('AX')).to.be.false;
  });

  it('Should validate a freeCirculation value', () => {
    expect(validator.validFreeCirculation('Yes')).to.be.true;
    expect(validator.validFreeCirculation('Other')).to.be.false;
    expect(validator.validFreeCirculation(undefined)).to.be.false;
  });

  it('Should validate a visitReason value', () => {
    expect(validator.validVisitReason('Holiday')).to.be.false;
    expect(validator.validVisitReason('Based')).to.be.true;
    expect(validator.validVisitReason(undefined)).to.be.false;
  });

  it('Should validate a valid gender', () => {
    expect(validator.validGender('Male')).to.be.true;
    expect(validator.validGender('')).to.be.false;
    expect(validator.validGender(undefined)).to.be.false;
    expect(validator.validGender('Other')).to.be.false;
    expect(validator.validGender('Unspecified')).to.be.true;
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
    expect(validator.validIntlPhone('12345')).to.be.true;
    expect(validator.validIntlPhone('1234544')).to.be.true;
    expect(validator.validIntlPhone('12233445566778899112')).to.be.true;
  });

  it('Should return false when less than 5 max more than 20 digits has letters or spaces', () => {
    expect(validator.validIntlPhone('1234')).to.be.false;
    expect(validator.validIntlPhone('122334455667788991123')).to.be.false;
    expect(validator.validIntlPhone('+123475')).to.be.false;
    expect(validator.validIntlPhone('1234x5')).to.be.false;
    expect(validator.validIntlPhone('1234 5')).to.be.false;
  });

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

  it('Should return true when validating different ports', () => {
    expect(validator.notSameValues(['ABC', 'DEF'])).to.be.true;
    expect(validator.notSameValues(['ABC', null])).to.be.true;
  });

  it('Should return false when validating the same ports', () => {
    expect(validator.notSameValues(['ABC', 'ABC'])).to.be.false;
    expect(validator.notSameValues(['ABC', 'abc'])).to.be.false;
    expect(validator.notSameValues(['ABc', 'aBc'])).to.be.false;
  });

  it('Should return true when a valid file and mimetype are provided', () => {
    expect(validator.isValidFileMime('jpg', 'image/jpeg')).to.be.true;
    expect(validator.isValidFileMime('jpeg', 'image/jpeg')).to.be.true;
    expect(validator.isValidFileMime('png', 'image/png')).to.be.true;
    expect(validator.isValidFileMime('pdf', 'application/pdf')).to.be.true;
    expect(validator.isValidFileMime('gif', 'image/gif')).to.be.true;
  });

  it('Should return false when a valid file with an different valid extension is provided', () => {
    expect(validator.isValidFileMime('png', 'image/jpeg')).to.be.false;
  });

  it('Should return false when a file with an invalid mimetype is provided', () => {
    expect(validator.isValidFileMime('png', 'application/txt')).to.be.false;
  });

  it('Should return false when a file with an unknown extension is provided', () => {
    expect(validator.isValidFileMime('svg', 'application/txt')).to.be.false;
    expect(validator.isValidFileMime('svg', 'image/svg+xml')).to.be.false;
  });

  it('Shoud return true when string is less than or equal to MAX_STRING_LENGTH', () => {
    const thirtyfive = 'AAAAAaaaa BBBBBbbbb CCCCCccccc';
    expect(validator.isValidStringLength(thirtyfive)).to.be.true;
  });

  it('Should return false when string is longer than MAX_STRING_LENGTH', () => {
    const thirtysix = 'AAAAAaaaa BBBBBbbbb CCCCCcccc DDDDDd';
    expect(validator.isValidStringLength(thirtysix)).to.be.false;
  });

  it('Should return true when registration is less than or equal to MAX_REGISTRATION_LENGTH', () => {
    const fifteen = 'AAAAAaaaa BBBBB';
    expect(validator.isValidRegistrationLength(fifteen)).to.be.true;
  });

  it('Should return false when registration is longer than MAX_REGISTRATION_LENGTH', () => {
    const sixteen = 'AAAAAaaaa BBBBBb';
    expect(validator.isValidRegistrationLength(sixteen)).to.be.false;
  });

  it('Should return true when email is less than or equal to MAX_EMAIL_LENGTH', () => {
    const fifty = 'AAAAAaaaa BBBBBbbbb CCCCCcccc DDDDDdddd EEEEEeeee ';
    const onehundredfifty = fifty.repeat(3);
    expect(validator.isValidEmailLength(onehundredfifty)).to.be.true;
  });

  it('Should return false when email is longer than MAX_EMAIL_LENGTH', () => {
    const fifty = 'AAAAAaaaa BBBBBbbbb CCCCCcccc DDDDDdddd EEEEEeeee ';
    const onehundredfifty = fifty.repeat(3);
    const onehundredfiftyone = `${onehundredfifty}A`;
    expect(validator.isValidEmailLength(onehundredfiftyone)).to.be.false;
  });

  describe('Departure and Arrival Dates', () => {
    const dateOne = '2019-01-01';
    const dateTwo = '2019-01-02';
    const dateOnePrime = '2019-01-01';

    it('Should retun true when departure date is less than or equal to arrival date', () => {
      const voyageDateObj = {
        departureDate: dateOne,
        arrivalDate: dateTwo,
      };
      expect(validator.isValidDepAndArrDate(voyageDateObj)).to.be.true;
    });

    it('Should return true when departure date equals arrival date', () => {
      const voyageDateObj = {
        departureDate: dateOne,
        arrivalDate: dateOnePrime,
      };
      expect(validator.isValidDepAndArrDate(voyageDateObj)).to.be.true;
    });

    it('Should return false when departure date is greater than arrival date', () => {
      const voyageDateObj = {
        departureDate: dateTwo,
        arrivalDate: dateOne,
      };
      expect(validator.isValidDepAndArrDate(voyageDateObj)).to.be.false;
    });

    it('should return true for validFlag if not null', () => {
      expect(validator.validFlag('anything')).to.be.true;
      expect(validator.validFlag('true')).to.be.true;
      expect(validator.validFlag(123)).to.be.true;
    });

    it('should return false for validFlag if null', () => {
      expect(validator.validFlag(undefined)).to.be.false;
      expect(validator.validFlag(null)).to.be.false;
    });

    it('should return false when provided country code is unknown', () => {
      expect(validator.validISO3Country('CHI')).to.be.false;
      expect(validator.validISO3Country('UK')).to.be.false;
    });

    it('should return true when provided country code is valid', () => {
      expect(validator.validISO3Country('USA')).to.be.true;
      expect(validator.validISO3Country('GBR')).to.be.true;
    });
  });

  describe('realDateFromString', () => {
    it('should return false for random strings and objects', () => {
      expect(validator.realDateFromString(false)).to.be.false;
      expect(validator.realDateFromString('hello')).to.be.false;
      expect(validator.realDateFromString('abc123')).to.be.false;
    });

    it('should return true for partial dates', () => {
      expect(validator.realDateFromString('2002')).to.be.true;
      expect(validator.realDateFromString('2002-12')).to.be.true;
    });
  });
});
