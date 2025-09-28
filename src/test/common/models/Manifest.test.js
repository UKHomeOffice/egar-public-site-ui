/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';

import sinon from 'sinon';
import fixtures from '../../fixtures.js';
import '../../global.test.js';
import { Manifest } from '../../../common/models/Manifest.class.js';

let clock = null;
const apiResponse = JSON.stringify({
  items: fixtures.garPeople(),
});

describe('ManifestModel', () => {
  const APRIL = 3;
    
  beforeEach(() => {
    clock = sinon.useFakeTimers({
      now: new Date(2024, APRIL, 11),
      shouldAdvanceTime: false,
      toFake: ["Date"],
    });
  });

  it('Should generate valid manifest data from a valid API response', () => {
    const manifest = new Manifest(apiResponse);
    expect(manifest.manifest).to.have.length(1);
  });

  it('Should not generate a manifest for invalid data', () => {
    const response = JSON.stringify({ message: 'GAR does not exist' });
    expect(new Manifest(response)).to.throw;
  });

  it('Should not generate a manifest for non JSON data', () => {
    try {
      const manifest = new Manifest('This will not work');
      expect(manifest).to.be.undefined;
    } catch (err) {
      expect(err.message).to.contain(`Unexpected token 'T', "This will not work" is not valid JSON`);
    }
  });

  it('Should validate a valid manifest', async () => {
    const manifest = new Manifest(apiResponse);
    expect(await manifest.validate()).to.be.true;
  });

  it('Should return true for captain crew for a valid manifest', () => {
    const manifest = new Manifest(apiResponse);
    expect(manifest.validateCaptainCrew()).to.be.true;
  });

  it('Should return true for captain crew for a single crew manifest', () => {
    const singleCrew = JSON.stringify({
      items: fixtures.garPeople(),
    });
    const manifest = new Manifest(singleCrew);
    expect(manifest.validateCaptainCrew()).to.be.true;
  });

  it('Should return false for captain crew for a single passenger manifest', () => {
    const singlePassenger = JSON.stringify({
      items: [
        {
          dateOfBirth: '1994-06-22',
          documentExpiryDate: '2023-06-22',
          documentNumber: '1283',
          documentType: 'Identity Card',
          firstName: 'James',
          garPeopleId: '1ca90ecf-12f4-4ccb-815d-651aae449fbd',
          gender: 'Male',
          issuingState: 'PTA',
          lastName: 'Smith',
          nationality: 'GBR',
          peopleType: {
            name: 'Passenger',
          },
          placeOfBirth: 'PTA',
        },
      ],
    });
    const manifest = new Manifest(singlePassenger);
    expect(manifest.validateCaptainCrew()).to.be.false;
  });

  it('Should return false for captain crew for no manifest', () => {
    const emptyManifest = JSON.stringify({
      items: [],
    });
    const manifest = new Manifest(emptyManifest);
    expect(manifest.validateCaptainCrew()).to.be.false;
  });

  it('Should not validate a manifest with missing data', async () => {
    const response = JSON.stringify({ items: [{ firstName: null, lastName: '' }] });
    const manifest = new Manifest(response);
    expect(await manifest.validate()).to.be.false;
  });

  it('Should not validate a manifest with a null date', async () => {
    const response = JSON.stringify({ items: [{ dateOfBirth: null }] });
    const manifest = new Manifest(response);
    expect(await manifest.validate()).to.be.false;
  });

  it('Should not validate a manifest with an invalid date', async () => {
    const response = JSON.stringify({ items: [{ dateOfBirth: '94-06-22' }] });
    const manifest = new Manifest(response);
    expect(await manifest.validate()).to.be.false;
  });

  it('Should generate an array of validation errors', async () => {
    const response = JSON.stringify({ items: [{ firstName: null }] });
    const manifest = new Manifest(response);
    await manifest.validate();
    expect(manifest.genErrValidations()).to.have.length(1);
  });

  it('Should generate a single error if two fields are missing', async () => {
    const response = JSON.stringify({ items: [{ firstName: null, lastName: '' }] });
    const manifest = new Manifest(response);
    await manifest.validate();
    expect(manifest.genErrValidations()).to.have.length(1);
  });

  it('Should return false if place of Birth is not present for a passenger', async () => {
    const singlePassenger = JSON.stringify({
      items: [
        {
          dateOfBirth: '1994-06-22',
          documentExpiryDate: '2023-06-22',
          documentNumber: '1283',
          documentType: 'Identity Card',
          firstName: 'James',
          garPeopleId: '1ca90ecf-12f4-4ccb-815d-651aae449fbd',
          gender: 'Male',
          issuingState: 'PTA',
          lastName: 'Smith',
          nationality: 'GBR',
          peopleType: {
            name: 'Passenger',
          },
          placeOfBirth: '',
        },
      ],
    });
    const manifest = new Manifest(singlePassenger);
    expect(await manifest.validate()).to.be.false;
  });

  it('Should return true if place of Birth is not present for a crew', () => {
    const singleCrew = JSON.stringify({
      items: [
        {
          dateOfBirth: '1994-06-22',
          documentExpiryDate: '2023-06-22',
          documentNumber: '1283',
          documentType: 'Identity Card',
          firstName: 'James',
          garPeopleId: '1ca90ecf-12f4-4ccb-815d-651aae449fbd',
          gender: 'Male',
          issuingState: 'PTA',
          lastName: 'Smith',
          nationality: 'GBR',
          peopleType: {
            name: 'Crew',
          },
          placeOfBirth: '',
        },
      ],
    });
    const manifest = new Manifest(singleCrew);
    expect(manifest.validateCaptainCrew()).to.be.true;
  });

  afterEach(()=>{
    clock.restore();
  });
});
