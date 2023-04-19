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

const controller = require('../../../../app/garfile/manifest/addnewperson/post.controller');

describe('GAR Manifest Add Person Post Controller', () => {
  let req; let res; let person; let garApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

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
        gar: { id: 'GAR-ID-1' },
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
      documentDesc: undefined,
    }

    garApiStub = sinon.stub(garApi, 'patch');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with errors if surname is empty', () => {
    req.body.lastName = '';
    person.lastName = '';
    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApiStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/manifest/addnewperson/index', {
        req, 
        cookie, 
        person, 
        persontype, 
        documenttype, 
        genderchoice, 
        errors: [new ValidationRule(validator.notEmpty, 'lastName', req.body.lastName, 'Enter the surname of the person')],
      });
    });
  });

  it('should redirect back if api rejects', () => {
    const cookie = new CookieModel(req);
    garApiStub.rejects('garApi.patch Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then().then(() => {
      expect(garApiStub).to.have.been.calledWith('GAR-ID-1', 'Draft', { people: [person] });
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/manifest/addnewperson/index', {
        req,
        cookie,
        person,
        persontype,
        documenttype,
        genderchoice,
        errors: [{ message: 'Error adding a new person. Try again later' }],
      });
    });
  });

  it('should render message if api returns one', () => {
    const cookie = new CookieModel(req);

    garApiStub.resolves(JSON.stringify({
      message: 'GAR not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiStub).to.have.been.calledOnceWithExactly('GAR-ID-1', 'Draft', { people: [person] });
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/manifest/addnewperson/index', {
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
    garApiStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApiStub).to.have.been.calledOnceWithExactly('GAR-ID-1', 'Draft', { people: [person] });
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
      expect(res.render).to.not.have.been.called;
    });
  });
});
