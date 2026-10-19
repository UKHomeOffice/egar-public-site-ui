const { expect } = require('chai');

const i18n = require('i18n');
const rewire = require('rewire');
const path = require('path');
const validator = require('../../../common/utils/validator');

const validations = rewire('../../../app/api/uploadgar/validations');

require('../../global.test');

describe('Upload GAR duplicate rows', () => {
  const person = {
    firstName: 'Jane',
    lastName: 'Smith',
    documentNumber: '123456',
    peopleType: 'Crew',
  };

  before(() => {
    i18n.configure({
      locales: ['en'],
      directory: path.join(__dirname, '../../../locales'),
      objectNotation: true,
      defaultLocale: 'en',
      register: global,
    });
  });

  const duplicateRules = (crew, passengers) =>
    validations
      .validations({}, crew, passengers)
      .flat()
      .filter((rule) => rule.identifier === 'file');

  const documentNumberRules = (crew, passengers) =>
    validations
      .validations({}, crew, passengers)
      .flat()
      .filter((rule) => rule.message === 'The file contains duplicate travel document numbers.');

  it('rejects duplicate crew rows with an actionable message', async () => {
    const rules = duplicateRules([person, { ...person }], []);
    expect(rules.map((rule) => rule.value)).to.deep.equal([true, false]);
    try {
      await validator.validateChains(rules.map((rule) => [rule]));
      expect.fail('Expected duplicate row validation to reject');
    } catch (errors) {
      expect(errors).to.deep.equal([rules[1]]);
      expect(errors[0].message).to.equal('The file contains duplicate row entry');
    }
  });

  it('rejects duplicate passenger rows', () => {
    const passenger = { ...person, peopleType: 'Passenger' };
    const rules = duplicateRules([], [passenger, { ...passenger }]);
    expect(rules.map((rule) => rule.value)).to.deep.equal([true, false]);
    expect(rules[1].message).to.include('duplicate row entry');
  });

  it('rejects a row copied between crew and passengers', () => {
    const rules = duplicateRules([person], [{ ...person, peopleType: 'Passenger' }]);
    expect(rules.map((rule) => rule.value)).to.deep.equal([true, false]);
  });

  it('accepts rows with the same name but different details', async () => {
    const rules = duplicateRules([person, { ...person, documentNumber: '654321' }], []);
    await validator.validateChains(rules.map((rule) => [rule]));
  });

  it('accepts an empty manifest', () => {
    expect(duplicateRules([], [])).to.deep.equal([]);
  });

  it('rejects a repeated document number when the document type is the same', async () => {
    const crew = [
      { ...person, documentType: 'Passport' },
      { ...person, firstName: 'Alex', documentType: 'Passport' },
    ];
    const rules = documentNumberRules(crew, []);
    expect(rules.map((rule) => rule.value)).to.deep.equal([true, false]);
    try {
      await validator.validateChains(rules.map((rule) => [rule]));
      expect.fail('Expected duplicate document number validation to reject');
    } catch (errors) {
      expect(errors).to.deep.equal([rules[1]]);
      expect(errors[0].message).to.equal('The file contains duplicate travel document numbers.');
    }
  });

  it('allows the same document number under a different document type', async () => {
    const crew = [
      { ...person, documentType: 'Passport' },
      { ...person, firstName: 'Alex', documentType: 'Identity Card' },
    ];
    const rules = documentNumberRules(crew, []);
    expect(rules.map((rule) => rule.value)).to.deep.equal([true, true]);
    await validator.validateChains(rules.map((rule) => [rule]));
  });

  it('does not report duplicate numbers when either document field is empty', () => {
    const crew = [
      { ...person, documentType: 'Passport', documentNumber: '' },
      { ...person, firstName: 'Alex', documentType: 'Passport', documentNumber: '' },
    ];
    expect(documentNumberRules(crew, [])).to.deep.equal([]);
  });
});

describe('Get message labels from i18n', () => {
  it('Should get voyage labels from i18n', () => {
    const getVoyageFieldLabel = validations.__get__('getVoyageFieldLabel');
    expect(getVoyageFieldLabel('arrivalPort')).to.equal(i18n.__('field_arrival_port'));
    expect(getVoyageFieldLabel('departurePort')).to.equal(i18n.__('field_departure_port'));
    expect(getVoyageFieldLabel('arrivalTime')).to.equal(i18n.__('field_arrival_time'));
    expect(getVoyageFieldLabel('departureTime')).to.equal(i18n.__('field_departure_time'));
    expect(getVoyageFieldLabel('arrivalDate')).to.equal(i18n.__('field_arrival_date'));
    expect(getVoyageFieldLabel('departureDate')).to.equal(i18n.__('field_departure_date'));
    expect(getVoyageFieldLabel('registration')).to.equal(i18n.__('field_aircraft_registration'));
    expect(getVoyageFieldLabel('craftType')).to.equal(i18n.__('field_aircraft_type'));
    expect(getVoyageFieldLabel('craftBase')).to.equal(i18n.__('field_aircraft_base'));
    expect(getVoyageFieldLabel('OTHER KEY')).to.equal('One of the voyage details (OTHER KEY)');
  });
  it('Should get crew / passenger details label from i18n', () => {
    const getCrewFieldLabel = validations.__get__('getCrewFieldLabel');
    expect(getCrewFieldLabel('documentType')).to.equal(i18n.__('field_travel_document_type'));
    expect(getCrewFieldLabel('issuingState')).to.equal(i18n.__('field_issuing_state'));
    expect(getCrewFieldLabel('documentNumber')).to.equal(i18n.__('field_travel_document_number'));
    expect(getCrewFieldLabel('lastName')).to.equal(i18n.__('field_surname'));
    expect(getCrewFieldLabel('firstName')).to.equal(i18n.__('field_given_name'));
    expect(getCrewFieldLabel('gender')).to.equal(i18n.__('field_gender'));
    expect(getCrewFieldLabel('dateOfBirth')).to.equal(i18n.__('field_dob'));
    expect(getCrewFieldLabel('placeOfBirth')).to.equal(i18n.__('field_birth_place'));
    expect(getCrewFieldLabel('nationality')).to.equal(i18n.__('field_nationality'));
    expect(getCrewFieldLabel('documentExpiryDate')).to.equal(i18n.__('field_document_expiry_date'));
    expect(getCrewFieldLabel('OTHER KEY')).to.equal('One of the value (OTHER KEY)');
  });
});
