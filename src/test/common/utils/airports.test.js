const { expect } = require('chai');

const airports = require('../../../common/utils/airports');

describe('airports utils', () => {
  describe('findByCode', () => {
    it('finds by ICAO (EGPR - Barra Airport)', () => {
      const a = airports.findByCode('EGPR');
      expect(a).to.be.an('object');
      expect(a).to.have.property('icao', 'EGPR');
      expect(a).to.have.property('british', true);
      expect(a).to.have.property('name').that.includes('BARRA');
    });

    it('finds by IATA (BRR - Barra Airport)', () => {
      const a = airports.findByCode('BRR');
      expect(a).to.be.an('object');
      expect(a).to.have.property('iata', 'BRR');
      expect(a).to.have.property('british', true);
    });

    it('finds by otherCodes (Oconomowoc 0WI8/OWI8) and is case-insensitive', () => {
      const a1 = airports.findByCode('0WI8');
      const a2 = airports.findByCode('owi8');
      expect(a1).to.be.an('object');
      expect(a1).to.have.property('name').that.includes('Oconomowoc');
      expect(a1).to.have.property('otherCodes').that.is.an('array');
      expect(a1.otherCodes).to.include('0WI8');
      expect(a1.otherCodes).to.include('OWI8');
      expect(a2).to.deep.equal(a1);
      expect(a1).to.have.property('british', false);
    });

    it('returns null for unknown or invalid codes', () => {
      expect(airports.findByCode(null)).to.equal(null);
      expect(airports.findByCode('')).to.equal(null);
      expect(airports.findByCode('ZZZX')).to.equal(null);
    });
  });

  describe('isBritishCode', () => {
    it('returns true for a British code (EGPR/BRR)', () => {
      expect(airports.isBritishCode('EGPR')).to.equal(true);
      expect(airports.isBritishCode('brr')).to.equal(true);
    });

    it('returns false for a non-British code (KVYS/VYS)', () => {
      expect(airports.isBritishCode('KVYS')).to.equal(false);
      expect(airports.isBritishCode('VYS')).to.equal(false);
    });
  });

  describe('filterBritish and filterBritishDesignated', () => {
    it('filterBritish returns only british===true', () => {
      const list = airports.filterBritish();
      expect(list).to.be.an('array').that.is.not.empty;
      expect(list.every((a) => a && a.british === true)).to.equal(true);
    });

    it('filterBritishDesignated returns only british===true && designated===true', () => {
      const list = airports.filterBritishDesignated();
      expect(list).to.be.an('array').that.is.not.empty;
      expect(list.every((a) => a && a.british === true && a.designated === true)).to.equal(true);
    });
  });

  describe('filterAirports', () => {
    it('can filter international (british:false)', () => {
      const intl = airports.filterAirports({ british: false });
      expect(intl).to.be.an('array').that.is.not.empty;
      expect(intl.every((a) => a.british === false)).to.equal(true);
    });

    it('can filter undesignated UK fields', () => {
      const ukUndesignated = airports.filterAirports({ british: true, undesignated: true });
      expect(ukUndesignated).to.be.an('array').that.is.not.empty;
      expect(ukUndesignated.every((a) => a.british === true && a.designated === false)).to.equal(true);
      // EGPR (Barra) is british but not designated; it should be included
      const egpr = ukUndesignated.find((a) => a.icao === 'EGPR');
      expect(egpr).to.be.an('object');
    });

    it('searches by text query across fields (q)', () => {
      const res1 = airports.filterAirports({ q: 'Oconomowoc' });
      expect(res1.find((a) => (a.name || '').includes('Oconomowoc'))).to.be.an('object');

      const res2 = airports.filterAirports({ q: 'egpr' });
      expect(res2.find((a) => a.icao === 'EGPR')).to.be.an('object');

      const res3 = airports.filterAirports({ q: '0wi8' });
      expect(res3.find((a) => Array.isArray(a.otherCodes) && a.otherCodes.includes('0WI8'))).to.be.an('object');
    });
  });
});
