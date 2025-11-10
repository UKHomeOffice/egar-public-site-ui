const { expect } = require('chai');

require('../../global.test');

const airportValidation = require('../../../common/utils/airportValidation');

describe('Airport Validation', () => {
  it('should return correct `not British message`', () => {
    expect(airportValidation.notBritishMsg).to.eq('Either the Arrival or Departure port must be a UK port');
  });

  it('should confirm Gatwick as British', () => {
    expect(airportValidation.isBritishAirport('LGW')).to.eq(true);
  });

  it('should not confirm LAX as British', () => {
    expect(airportValidation.isBritishAirport('LAX')).to.eq(false);
  });

  it('should error for absent airport', () => {
    const nonExistentAirportCode = 'RUBBISH';
    expect(() => airportValidation.isBritishAirport(nonExistentAirportCode)).to.throw(
      `no airport matched code ${nonExistentAirportCode}`
    );
  });
});

describe('Airport Validation - UK Inbound Tests', () => {
  /* Oscar told us that flights where departure and/or arrival location defined by lat/long should be checked by UPT */

  it('UK Inbound when arrival and destination airport code are both null', () => {
    expect(airportValidation.isJourneyUKInbound(null, null)).to.eq(true);
  });

  it('UK Inbound when arrival and destination airport code are both empty string', () => {
    expect(airportValidation.isJourneyUKInbound('', '')).to.eq(true);
  });

  it('not UK Inbound when departure is UK but arrival null', () => {
    expect(airportValidation.isJourneyUKInbound('LGW', null)).to.eq(false);
  });

  it('UK Inbound when departure is null but arrival UK', () => {
    expect(airportValidation.isJourneyUKInbound(null, 'LGW')).to.eq(true);
  });

  it('UK Inbound when departure is not UK but arrival null', () => {
    expect(airportValidation.isJourneyUKInbound('LAX', null)).to.eq(true);
  });

  it('not UK Inbound when departure is null but arrival not UK', () => {
    expect(airportValidation.isJourneyUKInbound(null, 'LAX')).to.eq(false);
  });

  it('UK Inbound when departure is not british and arrival in UK', () => {
    expect(airportValidation.isJourneyUKInbound('LAX', 'LGW')).to.eq(true);
  });

  it('not UK Inbound when departure is in UK and arrival outside UK', () => {
    expect(airportValidation.isJourneyUKInbound('LGW', 'LAX')).to.eq(false);
  });

  it('not UK Inbound when departure is in UK and arrival in UK', () => {
    expect(airportValidation.isJourneyUKInbound('LHR', 'LGW')).to.eq(false);
  });

  it('not UK Inbound when departure is outside UK and arrival outside UK', () => {
    expect(airportValidation.isJourneyUKInbound('LAX', 'BIKL')).to.eq(false);
  });
});

describe('Airport Validation - UK Inbound Tests Crown Dependencies', () => {
  it('not UK Inbound when departure CD and destination null', () => {
    expect(airportValidation.isJourneyUKInbound('IOM', null)).to.eq(false);
  });

  it('UK Inbound when departure null and destination CD', () => {
    expect(airportValidation.isJourneyUKInbound(null, 'IOM')).to.eq(true);
  });

  it('UK Inbound when departure not UK and destination CD', () => {
    expect(airportValidation.isJourneyUKInbound('LAX', 'IOM')).to.eq(true);
  });

  it('not UK Inbound when departure CD and destination non UK', () => {
    expect(airportValidation.isJourneyUKInbound('IOM', 'LAX')).to.eq(false);
  });

  it('not UK Inbound when departure UK and destination CD', () => {
    expect(airportValidation.isJourneyUKInbound('LGW', 'IOM')).to.eq(false);
  });

  it('not UK Inbound when departure CD and destination UK', () => {
    expect(airportValidation.isJourneyUKInbound('IOM', 'LGW')).to.eq(false);
  });
});
