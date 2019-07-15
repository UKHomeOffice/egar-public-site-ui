/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');

const { Manifest } = require('../common/models/Manifest.class');

const apiResponse = JSON.stringify({
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
      nationality: 'PTA',
      peopleType: {
        name: 'Captain',
      },
      placeOfBirth: 'PTA',
    },
  ],
});

describe('ManifestModel', () => {
  it('Should generate valid manifest data from a valid API response', () => {
    const manifest = new Manifest(apiResponse);
    expect(manifest.manifest).to.have.length(1);
  });

  it('Should not generate a manifest for invalid data', () => {
    const response = JSON.stringify({ message: 'GAR does not exist' });
    expect(new Manifest(response)).to.throw;
  });

  it('Should validate a valid manifest', () => {
    const manifest = new Manifest(apiResponse);
    expect(manifest.validate()).to.be.true;
  });

  it('Should not validate a manifest with missing data', () => {
    const response = JSON.stringify({ items: [{ firstName: null, lastName: '' }] });
    const manifest = new Manifest(response);
    expect(manifest.validate()).to.be.false;
  });

  it('Should not validate a manifest with an invalid date', () => {
    const response = JSON.stringify({ items: [{ dateOfBirth: '94-06-22' }] });
    const manifest = new Manifest(response);
    expect(manifest.validate()).to.be.false;
  });

  it('Should generate an array of validation errors', () => {
    const response = JSON.stringify({ items: [{ firstName: null }] });
    const manifest = new Manifest(response);
    manifest.validate();
    expect(manifest.genErrValidations()).to.have.length(1);
  });

  it('Should generate a single error if two fields are missing', () => {
    const response = JSON.stringify({ items: [{ firstName: null, lastName: '' }] });
    const manifest = new Manifest(response);
    manifest.validate();
    expect(manifest.genErrValidations()).to.have.length(1);
  });
});
