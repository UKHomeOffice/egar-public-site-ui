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
const controller = require('../../../../app/garfile/manifest/addnewperson/post.controller');

describe('GAR Manifest Add Person Post Controller', () => {
  let req;
  let res;
  let person;
  let patch;

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
      },
      session: { gar: { id: 'stale-session-id' } },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      locals: { gar: { garId: 'GAR-ID-1' } },
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
    };
    patch = sinon.stub(garApi, 'patch').resolves({});
  });

  afterEach(() => sinon.restore());

  function expectErrors(errors) {
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/manifest/addnewperson/index', {
      req,
      cookie: new CookieModel(req),
      person,
      persontype,
      documenttype,
      genderchoice,
      errors,
    });
  }

  it('renders validation errors without adding a person', async () => {
    req.body.lastName = '';
    person.lastName = '';
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors([new ValidationRule(validator.isNotEmpty, 'lastName', '', 'Enter the surname of the person')]);
  });

  it('renders a generic error if adding the person fails', async () => {
    patch.rejects(new Error('Connection unavailable'));
    await controller(req, res);
    expectErrors([{ message: 'Error adding a new person. Try again later' }]);
  });

  it('preserves the message on an HTTP rejection', async () => {
    patch.rejects(
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
    patch.resolves({ message: 'GAR not found' });
    await controller(req, res);
    expectErrors([{ message: 'GAR not found' }]);
  });

  it('adds the normalized person to the verified GAR and returns to the manifest', async () => {
    await controller(req, res);
    expect(patch).to.have.been.calledOnceWithExactly('GAR-ID-1', 'Draft', { people: [person] });
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });
});
