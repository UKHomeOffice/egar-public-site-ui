const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../../global.test');
const CookieModel = require('../../../../common/models/Cookie.class');
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const validator = require('../../../../common/utils/validator');
const ValidationRule = require('../../../../common/models/ValidationRule.class');
const { garApi } = require('../../../../common/services/dataAccessApi');
const controller = require('../../../../app/garfile/manifest/editperson/post.controller');

describe('Manifest Edit Person Post Controller', () => {
  let req;
  let res;
  let person;
  let update;

  beforeEach(() => {
    req = {
      body: {
        firstName: 'Benjamin',
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
      session: { gar: { id: 'stale-session-id' } },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      locals: { gar: { garId: '9001' } },
    };
    person = {
      firstName: 'Benjamin',
      lastName: 'Sisko',
      gender: 'Male',
      dateOfBirth: '1937-06-07',
      placeOfBirth: 'New Orleans',
      nationality: 'USA',
      peopleType: 'Captain',
      documentNumber: '1234567890',
      documentType: 'Passport',
      issuingState: 'USA',
      documentExpiryDate: '2150-05-04',
      documentDesc: undefined,
      garPeopleId: '9002',
    };
    update = sinon.stub(garApi, 'updateGarPerson').resolves({});
  });

  afterEach(() => sinon.restore());

  function expectErrors(errors) {
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/manifest/editperson/index', {
      req,
      cookie: new CookieModel(req),
      person,
      persontype,
      documenttype,
      genderchoice,
      errors,
    });
  }

  it('renders validation errors without updating the person', async () => {
    req.body.lastName = '';
    person.lastName = '';
    await controller(req, res);
    expect(update).not.to.have.been.called;
    expectErrors([new ValidationRule(validator.isNotEmpty, 'lastName', '', 'Enter the surname of the person')]);
  });

  it('renders a generic error if updating the person fails', async () => {
    update.rejects(new Error('Connection unavailable'));
    await controller(req, res);
    expectErrors([{ message: 'Failed to update GAR person. Try again' }]);
  });

  it('preserves the message on an HTTP rejection', async () => {
    update.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'GAR not found' },
      })
    );
    await controller(req, res);
    expectErrors([{ message: 'GAR not found' }]);
  });

  it('renders a decoded API error rather than continuing', async () => {
    update.resolves({ message: 'GAR not found' });
    await controller(req, res);
    expectErrors([{ message: 'GAR not found' }]);
  });

  it('updates the normalized person in the verified GAR and returns to the manifest', async () => {
    await controller(req, res);
    expect(update).to.have.been.calledOnceWithExactly('9001', person);
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });
});
