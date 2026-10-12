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

  it('rejects duplicate crew rows with an actionable message', async () => {
    const rules = duplicateRules([person, { ...person }], []);
    expect(rules.map((rule) => rule.value)).to.deep.equal([false]);
    try {
      await validator.validateChains(rules.map((rule) => [rule]));
      expect.fail('Expected duplicate row validation to reject');
    } catch (errors) {
      expect(errors).to.deep.equal(rules);
      expect(errors[0].message).to.equal('The file has 2 entries for people with the same document details.');
    }
  });

  it('reports the total number of matching rows', () => {
    const rules = duplicateRules([person, { ...person }, { ...person }], []);
    expect(rules.map((rule) => rule.value)).to.deep.equal([false]);
    expect(rules.map((rule) => rule.message)).to.deep.equal([
      'The file has 3 entries for people with the same document details.',
    ]);
  });

  it('counts rows across all duplicate groups', () => {
    const otherPerson = { ...person, firstName: 'Alex' };
    const rules = duplicateRules([person, { ...person }, otherPerson, { ...otherPerson }, { ...otherPerson }], []);

    expect(rules).to.have.lengthOf(1);
    expect(rules[0].message).to.equal('The file has 5 entries for people with the same document details.');
    expect(rules[0].value).to.equal(false);
  });

  it('accepts a manifest without duplicate rows', () => {
    const rules = duplicateRules([person, { ...person, documentNumber: '654321' }], []);
    expect(rules.map((rule) => rule.value)).to.deep.equal([true]);
  });

  it('rejects duplicate rows copied between crew and passengers once', () => {
    const rules = duplicateRules([person], [{ ...person, peopleType: 'Passenger' }]);

    expect(rules).to.have.lengthOf(1);
    expect(rules[0].value).to.equal(false);
  });

  it('rejects duplicate passenger rows', () => {
    const passenger = { ...person, peopleType: 'Passenger' };
    const rules = duplicateRules([], [passenger, { ...passenger }]);
    expect(rules).to.have.lengthOf(1);
    expect(rules[0].value).to.equal(false);
    expect(rules[0].message).to.equal('The file has 2 entries for people with the same document details.');
  });

  it('accepts rows with the same name but different details', async () => {
    const rules = duplicateRules([person, { ...person, documentNumber: '654321' }], []);
    await validator.validateChains(rules.map((rule) => [rule]));
  });

  it('accepts an empty manifest', () => {
    expect(duplicateRules([], [])).to.deep.equal([]);
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
