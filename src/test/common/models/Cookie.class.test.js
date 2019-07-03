// const expect = require('chai').expect;
const chai = require('chai');
const expect = require('chai').expect;
const CookieModel = require('../../../common/models/Cookie.class');
const should = chai.should();

const req = {
  body: {
    departureDate: null,
    departurePort: 'ZZZZ',
  },
  session: {
    gar: {
      id: 12345,
      voyageDeparture: {
        departureDay: 6,
        departureMonth: 6,
        departureYear: 2019,
      },
    },
  },
};

describe('Cookie Class', () => {
  let cookie = {};
  let dateString = '';

  beforeEach(() => {
    cookie = new CookieModel(req);
    dateString = '2019-06-01';
  });

  it('Should generate a date string yyyy-MM-dd', () => {
    const year = 2019;
    const month = 6;
    const day = 1;

    const value = cookie.genDate(day, month, year);
    const expectedValue = '2019-6-1';
    expect(value).to.equal(expectedValue);
  });

  it('Should generate "undefined-undefined-undefined" string when arguments are undefined', () => {
    const year = undefined;
    const month = undefined;
    const day = undefined;

    const value = cookie.genDate(day, month, year);
    const expectedValue = 'undefined-undefined-undefined';
    expect(value).to.equal(expectedValue);
  });

  it('Should return year from a date string yyyy-MM-dd', () => {
    const year = cookie.dateSlice('year', dateString);
    expect(year).to.equal('2019');
  });

  it('Should return month from date string yyyy-MM-dd', () => {
    const month = cookie.dateSlice('month', dateString);
    expect(month).to.equal('06');
  });

  it('Should return day from date string yyyy-MM-dd', () => {
    const day = cookie.dateSlice('day', dateString);
    expect(day).to.equal('01');
  });

  it('Should return empty string for year when date string is "undefined-undefined-undefined"', () => {
    dateString = 'undefined-undefined-undefined';
    const year = cookie.dateSlice('year', dateString);
    expect(year).to.equal('');
  });

  it('Should return empty string for month when date string is "undefined-undefined-undefined"', () => {
    dateString = 'undefined-undefined-undefined';
    const month = cookie.dateSlice('month', dateString);
    expect(month).to.equal('');
  });

  it('Should return empty string for day when date string is "undefined-undefined-undefined"', () => {
    dateString = 'undefined-undefined-undefined';
    const day = cookie.dateSlice('day', dateString);
    expect(day).to.equal('');
  });

  it('Should throw error when dateType is invalid', () => {
    expect(() => {
      cookie.dateSlice('era', dateString);
    }).to.throw('dateType must be day month or year');
  });
});
