/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

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
        expect(() => airportValidation.isBritishAirport(nonExistentAirportCode)).to.throw(`no airport matched code ${nonExistentAirportCode}`);
    });
  });
  