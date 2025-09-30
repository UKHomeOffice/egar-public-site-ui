const { expect } = require('chai');

const i18n = require('i18n');
const rewire = require('rewire');

const validations = rewire('../../../app/api/uploadgar/validations');

require('../../global.test');

describe('Get message labels from i18n', () => {
  it('Should get voyage labels from i18n', () => {
    const getVoyageFieldLabel = validations.__get__('getVoyageFieldLabel');
    expect(getVoyageFieldLabel('arrivalPort')).to.equal(
      i18n.__('field_arrival_port')
    );
    expect(getVoyageFieldLabel('departurePort')).to.equal(
      i18n.__('field_departure_port')
    );
    expect(getVoyageFieldLabel('arrivalTime')).to.equal(
      i18n.__('field_arrival_time')
    );
    expect(getVoyageFieldLabel('departureTime')).to.equal(
      i18n.__('field_departure_time')
    );
    expect(getVoyageFieldLabel('arrivalDate')).to.equal(
      i18n.__('field_arrival_date')
    );
    expect(getVoyageFieldLabel('departureDate')).to.equal(
      i18n.__('field_departure_date')
    );
    expect(getVoyageFieldLabel('registration')).to.equal(
      i18n.__('field_aircraft_registration')
    );
    expect(getVoyageFieldLabel('craftType')).to.equal(
      i18n.__('field_aircraft_type')
    );
    expect(getVoyageFieldLabel('craftBase')).to.equal(
      i18n.__('field_aircraft_base')
    );
    expect(getVoyageFieldLabel('OTHER KEY')).to.equal(
      'One of the voyage details (OTHER KEY)'
    );
  });
  it('Should get crew / passenger details label from i18n', () => {
    const getCrewFieldLabel = validations.__get__('getCrewFieldLabel');
    expect(getCrewFieldLabel('documentType')).to.equal(
      i18n.__('field_travel_document_type')
    );
    expect(getCrewFieldLabel('issuingState')).to.equal(
      i18n.__('field_issuing_state')
    );
    expect(getCrewFieldLabel('documentNumber')).to.equal(
      i18n.__('field_travel_document_number')
    );
    expect(getCrewFieldLabel('lastName')).to.equal(i18n.__('field_surname'));
    expect(getCrewFieldLabel('firstName')).to.equal(
      i18n.__('field_given_name')
    );
    expect(getCrewFieldLabel('gender')).to.equal(i18n.__('field_gender'));
    expect(getCrewFieldLabel('dateOfBirth')).to.equal(i18n.__('field_dob'));
    expect(getCrewFieldLabel('placeOfBirth')).to.equal(
      i18n.__('field_birth_place')
    );
    expect(getCrewFieldLabel('nationality')).to.equal(
      i18n.__('field_nationality')
    );
    expect(getCrewFieldLabel('documentExpiryDate')).to.equal(
      i18n.__('field_document_expiry_date')
    );
    expect(getCrewFieldLabel('OTHER KEY')).to.equal(
      'One of the value (OTHER KEY)'
    );
  });
});
