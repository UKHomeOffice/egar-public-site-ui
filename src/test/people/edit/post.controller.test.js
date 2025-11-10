/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const persontype = require('../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../common/seeddata/egar_gender_choice.json');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const personApi = require('../../../common/services/personApi');

const controller = require('../../../app/people/edit/post.controller');

describe('Person Edit Post Controller', () => {
  let req;
  let res;
  let person;
  let personApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    apiResponse = {
      items: [{ garPeopleId: 1 }, { garPeopleId: 2 }],
    };

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
        travelDocumentOther: 'Id Card',
        issuingState: 'USA',
        expiryYear: '2150',
        expiryMonth: '05',
        expiryDay: '04',
        garPeopleId: '9002',
      },
      session: {
        u: { dbId: '9001' },
        editPerson: { personId: 'EDIT-PERSON-ID-1' },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    person = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      dateOfBirth: '1937-06-07',
      placeOfBirth: req.body.birthplace,
      nationality: 'USA', // Check it upper cases it
      peopleType: req.body.personType,
      documentNumber: req.body.travelDocumentNumber,
      documentType: req.body.travelDocumentType,
      issuingState: 'USA', // Check it upper cases it
      documentExpiryDate: '2150-05-04',
      documentDesc: req.body.travelDocumentOther,
    };

    personApiStub = sinon.stub(personApi, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with errors if surname and first name is empty', () => {
    req.body.firstName = '';
    req.body.lastName = '';
    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(personApiStub).to.not.have.been.called;
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/people/edit/index', {
          req,
          cookie,
          persontype,
          documenttype,
          genderchoice,
          errors: [
            new ValidationRule(
              validator.isNotEmpty,
              'firstName',
              req.body.firstName,
              'Enter the given names of the person'
            ),
            new ValidationRule(validator.isNotEmpty, 'lastName', req.body.lastName, 'Enter the surname of the person'),
          ],
        });
      });
  });

  it('should render with messages if gar api rejects', () => {
    const cookie = new CookieModel(req);
    personApiStub.rejects('garApi.updateGarPerson Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(personApiStub).to.have.been.calledWith('9001', 'EDIT-PERSON-ID-1', person);
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/people/edit/index', {
          req,
          cookie,
          persontype,
          documenttype,
          genderchoice,
          errors: [{ message: 'An error occurred. Please try again' }],
        });
      });
  });

  it('should render message if api returns one', () => {
    const cookie = new CookieModel(req);
    cookie.updateEditPerson(person);

    personApiStub.resolves(
      JSON.stringify({
        message: 'GAR not found',
      })
    );

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(personApiStub).to.have.been.calledWith('9001', 'EDIT-PERSON-ID-1', person);
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWith('app/people/edit/index', {
          cookie,
          persontype,
          documenttype,
          genderchoice,
          errors: [{ message: 'GAR not found' }],
        });
      });
  });

  it('should redirect on success', () => {
    personApiStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(personApiStub).to.have.been.calledWith('9001', 'EDIT-PERSON-ID-1', person);
        expect(res.redirect).to.have.been.calledWith('/people');
        expect(res.render).to.not.have.been.called;
      });
  });
  it('should render with validation messages if "Other" document type is selected and special characters, apostrophes or numbers are present in the given names', () => {
    // refers to "GivenName" in the people details form
    req.body.firstName = 'abcd1234';
    req.body.lastName = 'de;ce';
    req.body.travelDocumentType = 'Other';
    req.body.travelDocumentOther = 'xyz';
    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(personApiStub).to.not.have.been.called;
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/people/edit/index', {
          req,
          cookie,
          persontype,
          documenttype,
          genderchoice,
          errors: [
            new ValidationRule(
              validator.isAlpha,
              'firstName',
              req.body.firstName,
              'Given names must not contain special characters, apostrophes or numbers'
            ),
            new ValidationRule(
              validator.isAlpha,
              'lastName',
              req.body.lastName,
              'Surname must not contain special characters, apostrophes or numbers'
            ),
          ],
        });
      });
  });
});
