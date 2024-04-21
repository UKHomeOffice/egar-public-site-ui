/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');

const logger = require('../common/utils/logger')(__filename);

require('./global.test');

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

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


describe('Validator', () => {

  it('Should return true when input has leading space', () => {
    expect(validator.hasLeadingSpace(' aa')).to.be.true;
  });

  it('Should return false when input has trailing space', () => {
    expect(validator.hasLeadingSpace('aa ')).to.be.false;
  });

  it('Should return false when input has no leading space', () => {
    expect(validator.hasLeadingSpace('aa')).to.be.false;
  });

  it('Should return true when input has only symbols', () => {
    expect(validator.hasOnlySymbols('!!£')).to.be.true;
  });

  it('Should return false when input has symbols and alphabets', () => {
    expect(validator.hasOnlySymbols('a.a')).to.be.false;
  });

  it('Should return false when input starts with a symbol', () => {
    expect(validator.hasOnlySymbols('!aa')).to.be.false;
  });

  it('Should return false when input ends with a symbol', () => {
    expect(validator.hasOnlySymbols('aa$')).to.be.false;
  });

  it('Should return false when a horizontal tab present in the input', () => {
    expect(validator.containTabs('tab name')).to.be.false;
  });

  it('Should return false when a input starts with a tab', () => {
    expect(validator.containTabs('  name')).to.be.false;
  });

  it('Should return false when numeric inputs are not', () => {
    expect(validator.isNumeric('aa')).to.be.false;
    expect(validator.isNumeric('true')).to.be.false;
  });

  it('Should return true when numeric inputs are input', () => {
    expect(validator.isNumeric('12')).to.be.true;
    expect(validator.isNumeric('31')).to.be.true;
  });

  it('Should return false when string contains "\\n"', () => {
    expect(validator.isPrintable('John\n')).to.be.false;
  });

  it('Should return true when string does not contain "\\n"', () => {
    expect(validator.isPrintable('John Doe')).to.be.true;
  });

  it('Should return true when fields are empty', () => {
    expect(validator.isEmpty(null)).to.be.true;
    expect(validator.isEmpty(undefined)).to.be.true;
    expect(validator.isEmpty('')).to.be.true;
  });

  it('Should return false when fields are not empty', () => {
    expect(validator.isEmpty('World Wide Web')).to.be.false;
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
    expect(validator.validYear('2030')).to.be.true;
  });

  it('Should return false for a year not consisting of 4 characters', () => {
    expect(validator.validYear('20')).to.be.false;
    expect(validator.validYear('20200202')).to.be.false;
  });

  it('Should return true for real dates', () => {
    expect(validator.realDate(genDateObj('22', '12', '2050'))).to.be.true;
    expect(validator.realDate(genDateObj('01', '02', '2030'))).to.be.true;
  });

  it('Should return false for invalid dates', () => {
    expect(validator.realDate(null)).to.be.false;
    expect(validator.realDate(undefined)).to.be.false;
    expect(validator.realDate(genDateObj('aa', 'bb', 'cccc'))).to.be.false;
    expect(validator.realDate(genDateObj('1f', 'd2', '20S5'))).to.be.false;
    expect(validator.realDate(genDateObj('22', '0', '2025'))).to.be.false;
    expect(validator.realDate(genDateObj('22', '2', '0000'))).to.be.false;
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
    expect(validator.currentOrPastDate(genDateObj(day, nextMonth, year))).to.be.true;
    expect(validator.currentOrPastDate(genDateObj(day, nextMonth, nextYear))).to.be.true;
    expect(validator.currentOrPastDate(genDateObj(nextDay, month, nextYear))).to.be.true;
    expect(validator.currentOrPastDate(genDateObj('22', '12', '2055'))).to.be.true;
    expect(validator.currentOrPastDate(genDateObj('01', '01', '2020'))).to.be.true;

    clock.restore();
  });

  it('Should return false for a date before today', () => {
    expect(validator.currentOrPastDate(genDateObj('22','12','1999'))).to.be.false;
    expect(validator.currentOrPastDate(genDateObj('16','2','2019'))).to.be.false;
    expect(validator.currentOrPastDate(genDateObj('16','1','2021'))).to.be.false;
    expect(validator.currentOrPastDate(genDateObj('27','7','2023',))).to.be.false;
    expect(validator.currentOrPastDate(genDateObj('21','2','2024'))).to.be.false;
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

  it('Should return false when a YYYY is entered as a port without lat and long coords', () => {
    expect(validator.validatePortCoords(genPortObj('YYYY', '', ''))).to.be.false;
  });

  it('Should return true when YYYY is entered as a port alongside lat and long coords', () => {
    expect(validator.validatePortCoords(genPortObj('YYYY', '28.120439', '-7.077516'))).to.be.true;
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

  it('Should allow local UK mobile numbers', () => {
    expect(validator.validIntlPhone('07973111111')).to.be.true;
  });

  it('Should allow local UK landline numbers', () => {
    expect(validator.validIntlPhone('01223123456')).to.be.true;
  });

  it('Should allow UK mobile numbers with plus prefix', () => {
    expect(validator.validIntlPhone('+44123450284')).to.be.true;
  });

  it('Should allow UK mobile numbers with double zero prefix', () => {
    expect(validator.validIntlPhone('0044123450284')).to.be.true;
  });

  it('Should allow international UK landline numbers with plus prefix ', () => {
    expect(validator.validIntlPhone('+441223123456')).to.be.true;
  });

  it('Should allow US landline numbers in international format ', () => {
    expect(validator.validIntlPhone('01017182222222')).to.be.true;
  });
  


  it('Should reject numbers beginning double zeros that are less than 10 characters ', () => {
    expect(validator.validIntlPhone('001234567')).to.be.false;
  });

  it('Should reject numbers that do not begin with one of: 0, 00, +', () => {
    expect(validator.validIntlPhone('8812345678')).to.be.false;
  });

  it('Should reject numbers with spaces', () => {
    expect(validator.validIntlPhone('88 12345678')).to.be.false;
  });

  it('Should reject numbers with hyphens', () => {
    expect(validator.validIntlPhone('0044-12345678')).to.be.false;
  });

  it('Should reject numbers with periods', () => {
    expect(validator.validIntlPhone('0044.12345678')).to.be.false;
  });

  // Latitude tests
  it('Should return true for a valid latitude - 6 dp', () => {
    expect(validator.latitude('51.957681')).to.be.true;
    expect(validator.latitude('1.957624')).to.be.true;
    expect(validator.latitude('-51.957612')).to.be.true;
    expect(validator.latitude('90.000000')).to.be.true;
    expect(validator.latitude('-90.000000')).to.be.true;
  });

  it('Should return false for an invalid latitude - 6 dp', () => {
    expect(validator.latitude('51.9537')).to.be.false;
    expect(validator.latitude('51.95377')).to.be.false;
    expect(validator.latitude('51.953')).to.be.false;
    expect(validator.latitude('51.95')).to.be.false;
    expect(validator.latitude('51.9')).to.be.false;
    expect(validator.latitude('51')).to.be.false;
    expect(validator.latitude('90.0001')).to.be.false;
    expect(validator.latitude('-90.0001')).to.be.false;
  });

  // Longitude tests
  it('Should return true for a valid longitude - 6 dp', () => {
    expect(validator.longitude('-1.245623')).to.be.true;
    expect(validator.longitude('1.957667')).to.be.true;
    expect(validator.longitude('12.957689')).to.be.true;
    expect(validator.longitude('180.000000')).to.be.true;
    expect(validator.longitude('-180.000000')).to.be.true;
  });

  it('Should return false for an invalid longitude - 6 dp', () => {
    expect(validator.longitude('-1.2456')).to.be.false;
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

  it('Shoud return true when an optional string is less than or equal to MAX_STRING_LENGTH', () => {
    const thirtyfive = 'AAAAAaaaa BBBBBbbbb CCCCCccccc';
    expect(validator.isValidOptionalStringLength(thirtyfive)).to.be.true;
  });

  it('Should return false when an optional string is longer than MAX_STRING_LENGTH', () => {
    const thirtysix = 'AAAAAaaaa BBBBBbbbb CCCCCcccc DDDDDd';
    expect(validator.isValidOptionalStringLength(thirtysix)).to.be.false;
  });

  it('Should return true when an optional string is undefined', () => {
    const undefinedString = undefined;
    expect(validator.isValidOptionalStringLength(undefinedString)).to.be.true;
  });

  it('Should return true when an optional string is null', () => {
    const nullString = null;
    expect(validator.isValidOptionalStringLength(nullString)).to.be.true;
  });

  it('Should return true when an optional string is null', () => {
    const emptyString = '';
    expect(validator.isValidOptionalStringLength(emptyString)).to.be.true;
  });

  it('Should return false when an optional string has only Symbols', () => {
    const onlySymbols = '$$';
    expect(validator.isValidOptionalStringLength(onlySymbols)).to.be.false;
  });

  it('Should return false when an optional string has leading spaces', () => {
    const leadingSpaces = ' London';
    expect(validator.isValidOptionalStringLength(leadingSpaces)).to.be.false;
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

  it('Should return true when text is less than or equal to MAX_TEXT_BOX_LENGTH', () => {
    const MAX_LENGTH = 250;
    const fifty = 'AAAAAaaaa BBBBBbbbb CCCCCcccc DDDDDdddd EEEEEeeee ';
    const twohundredfifty = fifty.repeat(5);

    const valueObj = { value: twohundredfifty, maxLength: MAX_LENGTH };
    expect(validator.validTextLength(valueObj)).to.be.true;
  });

  it('Should return false when text is longer than MAX_TEXT_BOX_LENGTH', () => {
    const MAX_LENGTH = 250;
    const fifty = 'AAAAAaaaa BBBBBbbbb CCCCCcccc DDDDDdddd EEEEEeeee ';
    const twohundredfifty = fifty.repeat(5);
    const twohundredfiftyone = `${twohundredfifty}A`;

    const valueObj = { value: twohundredfiftyone, maxLength: MAX_LENGTH };
    expect(validator.validTextLength(valueObj)).to.be.false;
  });

  describe('Departure and Arrival Dates', () => {
    const dateOne = '2019-01-01';
    const dateTwo = '2019-01-02';
    const dateOnePrime = '2019-01-01';
    const timeOne = '03:15:00';
    const timeTwo = '04:15:00';
    const timeOnePrime = '03:15:00';

    it('Should retun true when departure datetime is less than or equal to arrival datetime', () => {
      const voyageDateObj = {
        departureDate: dateOne,
        departureTime: timeTwo,
        arrivalDate: dateTwo,
        arrivalTime: timeOne,
      };
      expect(validator.isValidDepAndArrDate(voyageDateObj)).to.be.true;
    });

    it('Should return false when departure datetime equals arrival datetime', () => {
      const voyageDateObj = {
        departureDate: dateOne,
        departureTime: timeOne,
        arrivalDate: dateOnePrime,
        arrivalTime: timeOnePrime,
      };
      expect(validator.isValidDepAndArrDate(voyageDateObj)).to.be.false;
    });

    it('Should return false when departure date is later than arrival date', () => {
      const voyageDateObj = {
        departureDate: dateTwo,
        departureTime: timeOne,
        arrivalDate: dateOne,
        arrivalTime: timeTwo,
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


  describe('realDateInFuture', () => {

    var currentDay, currentMonthStr, currentYearStr;
    beforeEach(function () {
      currentDay = new Date().getDate();
      //months are 0 to 11 so adding 1 to it for the normal representation of 1 to 12
      currentMonthStr = (new Date().getMonth() + 1).toString();
      currentYearStr = (new Date().getFullYear()).toString();
    });

    it('Should pass if the provided day is in future -- next day', () => {
      let futureDate = addDays(new Date(), 1);
      
      currentDay = futureDate.getDate().toString();
      currentMonthStr = (futureDate.getMonth() + 1).toString();
      currentYearStr = (futureDate.getFullYear()).toString();

      var currentDate = genDateObj(currentDay, currentMonthStr, currentYearStr);
      expect(validator.realDateInFuture(currentDate)).to.be.true;
    });

    it('should fail if the provided day is today', () => {
      var currentDate = genDateObj((currentDay).toString(), currentMonthStr, currentYearStr)
      expect(validator.realDateInFuture(currentDate)).to.be.false;
    });

    it('should fail if the provided day is old date -- 14/12/2007', () => {
      expect(validator.realDateInFuture(genDateObj('14', '12', '2007'))).to.be.false;
    });

    it('Should return false for invalid dates', () => {
      expect(validator.realDateInFuture(null)).to.be.false;
      expect(validator.realDateInFuture(undefined)).to.be.false;
      expect(validator.realDateInFuture(genDateObj('aa', 'bb', 'cccc'))).to.be.false;
      expect(validator.realDateInFuture(genDateObj('1f', 'd2', '20S5'))).to.be.false;
    });
  });

  describe('bornAfter1900', () => {

    var currentDay, currentMonthStr, currentYearStr;
    beforeEach(function () {
      currentDay = new Date().getDate();
      //months are 0 to 11 so adding 1 to it for the normal representation of 1 to 12
      currentMonthStr = (new Date().getMonth() + 1).toString();
      currentYearStr = (new Date().getFullYear()).toString();
    });

    it('Should pass if the provided day is after 1900 -- 01/01/1900', () => {
      expect(validator.bornAfter1900(genDateObj('01', '01', '1900'))).to.be.true;
    });

    it('Should pass if the provided day is after 1900 -- 05/06/1980', () => {
      expect(validator.bornAfter1900(genDateObj('05', '06', '1980'))).to.be.true;
    });

    it('Should pass if the provided day is after 1900 -- 07/10/1990', () => {
      expect(validator.bornAfter1900(genDateObj('07', '10', '1990'))).to.be.true;
    });

    it('Should pass if the provided day is after 1900 -- 15/03/1995', () => {
      expect(validator.bornAfter1900(genDateObj('15', '03', '1995'))).to.be.true;
    });

    it('Should pass if the provided day is after 1900 -- 14/08/2006', () => {
      expect(validator.bornAfter1900(genDateObj('14', '08', '2006'))).to.be.true;
    });

    it('Should pass if the provided day is after 1900 -- 12/03/2010', () => {
      expect(validator.bornAfter1900(genDateObj('12', '03', '2010'))).to.be.true;
    });

    it('Should pass if the provided day is after 1900 -- 10/05/2012', () => {
      expect(validator.bornAfter1900(genDateObj('10', '05', '2012'))).to.be.true;
    });

    it('Should pass if the provided day is after 1900 -- 14/07/2015', () => {
      expect(validator.bornAfter1900(genDateObj('14', '07', '2015'))).to.be.true;
    });

    it('should fail if the provided day is before 1900 -- 31/12/1899', () => {
      expect(validator.bornAfter1900(genDateObj('31', '12', '1899'))).to.be.false;
    });

    it('should fail if the provided day is before 1900 -- 01/01/0001', () => {
      expect(validator.bornAfter1900(genDateObj('01', '01', '0001'))).to.be.false;
    });

    it('should fail if the provided day is before 1900 -- 07/10/1750', () => {
      expect(validator.bornAfter1900(genDateObj('07', '10', '1750'))).to.be.false;
    });

    it('should fail if the provided day is before 1900 -- 15/12/1870', () => {
      expect(validator.bornAfter1900(genDateObj('15', '12', '1870'))).to.be.false;
    });

    it('should fail if the provided day is before 1900 -- 17/06/1600', () => {
      expect(validator.bornAfter1900(genDateObj('17', '06', '1600'))).to.be.false;
    });

    it('should pass if the provided day is today', () => {
      var currentDate = genDateObj((currentDay).toString(), currentMonthStr, currentYearStr)
      expect(validator.bornAfter1900(currentDate)).to.be.true;
    });

    // //commented out as: 1) yesterday implementation fails on 1st of each month 2) the test does not offer much over other ones
    // it('should pass if the provided day is yesterday', () => {
    //   var previousDay = genDateObj((currentDay - 1).toString(), currentMonthStr, currentYearStr)
    //   expect(validator.bornAfter1900(previousDay)).to.be.true;
    // });

    it('Should fail if the provided day is in future -- next day', () => {
      var date = genDateObj((currentDay + 1).toString(), currentMonthStr, currentYearStr);
      expect(validator.bornAfter1900(date)).to.be.false;
    });

    it('Should return false for invalid dates', () => {
      expect(validator.bornAfter1900(null)).to.be.false;
      expect(validator.bornAfter1900(undefined)).to.be.false;
      expect(validator.bornAfter1900(genDateObj('aa', 'bb', 'cccc'))).to.be.false;
      expect(validator.bornAfter1900(genDateObj('1f', 'd2', '20S5'))).to.be.false;
    });
  });

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
      actualResult = validator.sanitiseDateOrTime(testValue, type);

      expect(expectedResult).to.equal(actualResult);
    });

    it('Should allow 2 digits for the day', () => {
      testValue = '234';
      type = 'day';

      expectedResult = '23';
      actualResult = validator.sanitiseDateOrTime(testValue, type);

      expect(expectedResult).to.equal(actualResult);
    });

    // input month tests
    it('Should remove the aphacharacters from string with input month', () => {
      testValue = '3a';
      type = 'month';

      expectedResult = '3';
      actualResult = validator.sanitiseDateOrTime(testValue, type);

      expect(expectedResult).to.equal(actualResult);
    });

    it('Should allow 2 digits for the day', () => {
      testValue = '200';
      type = 'month';

      expectedResult = '20';
      actualResult = validator.sanitiseDateOrTime(testValue, type);

      expect(expectedResult).to.equal(actualResult);
    });

    // input year tests
    it('Should remove the aphacharacters from string with input year', () => {
      testValue = '2017aabbccddd';
      type = 'year';

      expectedResult = '2017';
      actualResult = validator.sanitiseDateOrTime(testValue, type);

      expect(expectedResult).to.equal(actualResult);
    });

    it('Should allow 4 digits for the year', () => {
      testValue = '201689654';
      type = 'year';

      expectedResult = '2016';
      actualResult = validator.sanitiseDateOrTime(testValue, type);

      expect(expectedResult).to.equal(actualResult);
    });

    // input hour tests
    it('Should remove the aphacharacters from string with input hour', () => {
      testValue = '15gregr';
      type = 'hour';

      expectedResult = '15';
      actualResult = validator.sanitiseDateOrTime(testValue, type);

      expect(expectedResult).to.equal(actualResult);
    });

    it('Should allow 2 digits for the hour', () => {
      testValue = '4615';
      type = 'hour';

      expectedResult = '46';
      actualResult = validator.sanitiseDateOrTime(testValue, type);

      expect(expectedResult).to.equal(actualResult);
    });

    // input minute tests
    it('Should remove the aphacharacters from string with input minute', () => {
      testValue = '42gregr';
      type = 'minute';

      expectedResult = '42';
      actualResult = validator.sanitiseDateOrTime(testValue, type);

      expect(expectedResult).to.equal(actualResult);
    });

    it('Should allow 2 digits for the minute', () => {
      testValue = '52148';
      type = 'minute';

      expectedResult = '52';
      actualResult = validator.sanitiseDateOrTime(testValue, type);

      expect(expectedResult).to.equal(actualResult);
    });
  });

  describe('Too far in the future tests', () => {

    //const clock = sinon.useFakeTimers(new Date(2020, 04, 11).getTime());
    let clock;
    const APRIL = 3;
    
    beforeEach(() => {
      clock = sinon.useFakeTimers({
        now: new Date(2023, APRIL, 11),
        shouldAdvanceTime: false,
        toFake: ["Date"],
      });
    })

    let actualResult;

    it('Should reject a date further than one month in the future in object format', () => {
      actualResult = validator.dateNotMoreThanMonthInFuture({ d: '1', m: '1', y: '2024' });
      expect(actualResult).to.equal(false);
    });

    it('Should accept a date within one month in the future in object format', () => {
      actualResult = validator.dateNotMoreThanMonthInFuture({ d: '11', m: '5', y: '2023' });
      expect(actualResult).to.equal(true);
    });

    it('Should reject a date further than one month in the future in date format', () => {
      actualResult = validator.dateNotMoreThanMonthInFuture(new Date(2024, 0, 1));
      expect(actualResult).to.equal(false);
    });

    it('Should accept a date within one month in the future in date format', () => {
      actualResult = validator.dateNotMoreThanMonthInFuture(new Date(2023, 4, 11));
      expect(actualResult).to.equal(true);
    });

    it('Should allow a date within two days in the future', () => {
      actualResult = validator.dateNotMoreThanTwoDaysInFuture(new Date(2023, APRIL, 13));
      expect(actualResult).to.equal(true);
    });

    it('Should reject a date within two days in the future - day', () => {
      actualResult = validator.dateNotMoreThanTwoDaysInFuture(new Date(2023, APRIL, 14));
      expect(actualResult).to.equal(false);
    });

    it('Should reject a date within two days in the future - month', () => {
      const MAY = 4;
      actualResult = validator.dateNotMoreThanTwoDaysInFuture(new Date(2023, MAY, 12));
      expect(actualResult).to.equal(false);
    });

    it('Should reject a date within two days in the future - year', () => {
      actualResult = validator.dateNotMoreThanTwoDaysInFuture(new Date(2024, APRIL, 12));
      expect(actualResult).to.equal(false);
    });

    afterEach(()=>{
      clock.restore();
    });
  });

  describe('Is date at least over 2 hours', () => {
    let clock;
    const MARCH = 2;
    
    beforeEach(() => {
      clock = sinon.useFakeTimers({
        now: new Date(2023, MARCH, 27, 14, 15),
        shouldAdvanceTime: false,
        toFake: ["Date"],
      });
    })

    it('Works on a valid by a day date', () => {
      expect(validator.isTwoHoursPriorDeparture(new Date(2023, MARCH, 28, 11, 0))).to.equal(true);
    });

    it('Works on a invalid date a day behind', () => {
      expect(validator.isTwoHoursPriorDeparture(new Date(2023, MARCH, 26, 14, 15))).to.equal(false);
    });

    it('Same day but 2 hour prior date is valid', () => {
      const validByHourDate = new Date(2023, MARCH, 27, 17, 15);
      expect(validator.isTwoHoursPriorDeparture(validByHourDate)).to.equal(true);

      const validByMinuteDate = new Date(2023, MARCH, 27, 16, 16);
      expect(validator.isTwoHoursPriorDeparture(validByMinuteDate)).to.equal(true);
    }); 

    it('Same day but not 2 hour prior date is inaccurate', () => {
      const invalidByHourDate = new Date(2023, MARCH, 27, 15, 15);
      expect(validator.isTwoHoursPriorDeparture(invalidByHourDate)).to.equal(false);

      const invalidByMinuteDate = new Date(2023, MARCH, 27, 16, 14);
      expect(validator.isTwoHoursPriorDeparture(invalidByMinuteDate)).to.equal(false);
    });    

    afterEach(()=>{
      clock.restore();
    });
  });

  describe('Universal Permission to Travel validators to check', () => {
      it('Validate Alpha string whilst invalidates incorrect ones', () => {
        const plainString = "Aaron";
        expect(validator.isAlpha(plainString)).to.eql(true);

        const stringWithSpace = "Aaron Adam";
        expect(validator.isAlpha(stringWithSpace)).to.eql(true);

        const stringWithSpaceAndDash = "Aaron Adam-Kingsbottom";
        expect(validator.isAlpha(stringWithSpaceAndDash)).to.eql(true);

        const stringWithNumberInIt = "Aaron Adam-Kingsbottom 3rd";
        expect(validator.isAlpha(stringWithNumberInIt)).to.eql(false);

        const stringWithSingleQuote = "Aaron O'Kingsbottom";
        expect(validator.isAlpha(stringWithSingleQuote)).to.eql(false);

    })

    it('Validates optional unprovided addresses which are valid', () => { 
      const blankOptionalStreet = '';
      expect(validator.isAddressValidCharacters(blankOptionalStreet)).to.eql(true);

      const nullOptionalStreet = null;
      expect(validator.isAddressValidCharacters(nullOptionalStreet)).to.eql(true);

      const undefinedOptionalStreet = undefined;
      expect(validator.isAddressValidCharacters(undefinedOptionalStreet)).to.eql(true);
    });

    it('Validates Addresses which are valid', () => {
      const streetNameWithASpace = "Homestead Road";
      expect(validator.isAddressValidCharacters(streetNameWithASpace)).to.eql(true);

      const streetNameWithADash = "Fuller-spark Drive";
      expect(validator.isAddressValidCharacters(streetNameWithADash)).to.eql(true);

      const streetNameWithAnapostrophe = "Pullman's Lane";
      expect(validator.isAddressValidCharacters(streetNameWithAnapostrophe)).to.eql(false);

      const houseNumber = "18";
      expect(validator.isAddressValidCharacters(houseNumber)).to.eql(true);
    })

    it('Invalidates Addresses which are invalid', () => { 
      const unicodeCharacterStreet = "Bräut street"
      expect(validator.isAddressValidCharacters(unicodeCharacterStreet)).to.eql(false);

      const specialCharacterStreet = "$$$ road";
      expect(validator.isAddressValidCharacters(specialCharacterStreet)).to.eql(false);
    })
    
    it('Validate postcode containing invalid chars', () => { 
      const unicodeCharacterStreet = "Bräut street"
      expect(validator.isPostCodeValidCharacters(unicodeCharacterStreet)).to.eql(false);

      const specialCharacterStreet = "LA'SW";
      expect(validator.isPostCodeValidCharacters(specialCharacterStreet)).to.eql(false);

      const postcode = "SE1 9BG";
      expect(validator.isPostCodeValidCharacters(postcode)).to.eql(true);

    });

    it('Validates airport code list accurate detects codes which are in and not in the list', ()  => {
      expect(validator.isValidAirportCode('LGW')).to.eql(true);
      expect(validator.isValidAirportCode('EGXJ')).to.eql(true);
      expect(validator.isValidAirportCode('LAX')).to.eql(true);
      expect(validator.isValidAirportCode('EHWO')).to.eql(true);

      expect(validator.isValidAirportCode('Not An airport code')).to.eql(false);
      expect(validator.isValidAirportCode('12345')).to.eql(false);

    })
  })
});
