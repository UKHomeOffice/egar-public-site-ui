/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const { expect } = require('chai');

require('../global.test');

const validator = require('../../common/utils/validator');
const peopleValidations = require('../../app/people/validations');
const ValidationRule = require('../../common/models/ValidationRule.class');

describe('People validations', () => {
  let validSavedPersonReq; let invalidSavedPersonReq;

  beforeEach(() => {
    validSavedPersonReq = {
      body: {
        firstName: 'Benjamin',
        middleName: 'Banana',
        lastName: 'Sisko',
        gender: 'Male',
        dobYear: '1937',
        dobMonth: '06',
        dobDay: '07',
        birthplace: 'New Orleans',
        nationality: 'USA',
        personType: 'Captain',
        travelDocumentNumber: '1234567890',
        travelDocumentType: 'Passport',
        issuingState: 'USA',
        expiryYear: '2150',
        expiryMonth: '05',
        expiryDay: '04',
        garPeopleId: '9002',
      },
    };
    invalidSavedPersonReq = {
      body: {
        firstName: 'Benjamin123',
        middleName: 'Banana',
        lastName: 'Sisko',
        gender: 'Male',
        dobYear: '1937',
        dobMonth: '06',
        dobDay: '07',
        birthplace: 'New Orleans',
        nationality: 'USA',
        personType: 'Captain',
        travelDocumentNumber: '1234567890',
        travelDocumentType: 'Passport',
        issuingState: 'USA',
        expiryYear: '2150',
        expiryMonth: '05',
        expiryDay: '04',
        garPeopleId: '9002',
      },
    };
  });
  it('Accepts a valid saved person and does not raise an exception and resolves', async () => {
    const validationsForPeople = peopleValidations.validations(validSavedPersonReq);
    expect(
      await validator.validateChains(validationsForPeople)
    ).to.equal(undefined);
  });

  it('if a middle name is a blank, that should be fine, it is an optional field.', async () => {
    const noMiddleNameRequest = validSavedPersonReq;
    noMiddleNameRequest.body.middleName = '';

    const validationsForPeople = peopleValidations.validations(noMiddleNameRequest);
    expect(
      await validator.validateChains(validationsForPeople)
    ).to.equal(undefined);
  });

  it('if a middle name contains special characters message, it should be invalid', async () => {
    const noMiddleNameRequest = validSavedPersonReq;
    noMiddleNameRequest.body.middleName = '$$$';

    const validationsForPeople = peopleValidations.validations(noMiddleNameRequest);
    try {
      await validator.validateChains(validationsForPeople);
      expect(true).to.equal(false);
    } catch (err) {
      expect(JSON.stringify(err)).to.equal(
        '[{"identifier":"middleName","value":"$$$","message":"Middle name must not contain special characters, apostrophes or numbers"}]'
      );
    }
  });

  it('if a middle name is over 35 character, it should be invalid', async () => {
    const noMiddleNameRequest = validSavedPersonReq;
    noMiddleNameRequest.body.middleName = 'Abcdef Abcdef Abcdef Abcdef Abcdef Abcdef Abcdef';

    const validationsForPeople = peopleValidations.validations(noMiddleNameRequest);
    try {
      await validator.validateChains(validationsForPeople);
      expect(true).to.equal(false);
    } catch (err) {
      expect(JSON.stringify(err)).to.equal(
        '[{"identifier":"middleName","value":"Abcdef Abcdef Abcdef Abcdef Abcdef Abcdef Abcdef","message":"Middle name must be 35 characters or less"}]'
      );
    }
  });

  it('if a middle name contains jsut spaces e.g. " ", then it should be invalid.', async () => {
    const noMiddleNameRequest = validSavedPersonReq;
    noMiddleNameRequest.body.middleName = ' ';

    const validationsForPeople = peopleValidations.validations(noMiddleNameRequest);
    try {
      await validator.validateChains(validationsForPeople);
      expect(true).to.equal(false);
    } catch (err) {
      expect(JSON.stringify(err)).to.equal(
        '[{"identifier":"middleName","value":" ","message":"Enter the middle name of the person"}]'
      );
    }
  });
});
