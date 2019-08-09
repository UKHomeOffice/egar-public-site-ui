/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../../global.test');
const CookieModel = require('../../../../common/models/Cookie.class');
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const validator = require('../../../../common/utils/validator');
const ValidationRule = require('../../../../common/models/ValidationRule.class');
const garApi = require('../../../../common/services/garApi');

const controller = require('../../../../app/garfile/manifest/editperson/post.controller');

describe('Manifest Edit Person Post Controller', () => {
  let req; let res; let person;

  beforeEach(() => {
    chai.use(sinonChai);

    apiResponse = {
      items: [{ garPeopleId: 1 }, { garPeopleId: 2 }],
    };

    // TODO: Why the inconsistencies with field names
    req = {
      body: {
        firstName: 'Benjamin',
        lastName: 'Sisko',
        gender: 'Male',
        dobYear: '1937',
        dobMonth: '06',
        dobDay: '07',
        birthplace: 'New Orleans',
        nationality: 'usa',
        personType: 'Captain',
        travelDocumentNumber: '1234567890',
        travelDocumentType: 'Passport',
        issuingState: 'usa',
        expiryYear: '2150',
        expiryMonth: '05',
        expiryDay: '04',
        garPeopleId: '9002',
      },
      session: {
        gar: { id: '9001' },
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
      garPeopleId: req.body.garPeopleId,
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with errors if surname is empty', () => {
    req.body.lastName = '';
    person.lastName = ''; // expected
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'updateGarPerson');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.updateGarPerson).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/manifest/editperson/index', {
        req,
        cookie,
        person,
        persontype,
        documenttype,
        genderchoice,
        errors: [
          new ValidationRule(validator.notEmpty, 'lastName', req.body.lastName, 'Enter the surname of the person'),
        ],
      });
    });
  });

  // render when gar api rejects
  it('should render with messages if gar api rejects', () => {
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'updateGarPerson').rejects('garApi.updateGarPerson Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.updateGarPerson).to.have.been.calledWith('9001', person);
      expect(res.render).to.have.been.calledWith('app/garfile/manifest/editperson/index', {
        req,
        cookie,
        person,
        persontype,
        documenttype,
        genderchoice,
        errors: [{ message: 'Failed to update GAR person. Try again' }],
      });
    });
  });

  // render when gar api returns error message
  it('should render message if api returns one', () => {
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'updateGarPerson').resolves(JSON.stringify({
      message: 'GAR not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.updateGarPerson).to.have.been.calledWith('9001', person);
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/garfile/manifest/editperson/index', {
        req,
        cookie,
        person,
        persontype,
        documenttype,
        genderchoice,
        errors: [{ message: 'GAR not found' }],
      });
    });
  });

  it('should redirect on success', () => {
    sinon.stub(garApi, 'updateGarPerson').resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApi.updateGarPerson).to.have.been.calledWith('9001', person);
      expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
      expect(res.render).to.not.have.been.called;
    });
  });
});
