/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

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
  let req; let res; let person; let personApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    apiResponse = {
      items: [{ garPeopleId: 1 }, { garPeopleId: 2 }],
    };

    // TODO: Why the inconsistencies with field names
    req = {
      body: {
        'first-name': 'Benjamin',
        'last-name': 'Sisko',
        gender: 'Male',
        dobYear: '1937',
        dobMonth: '06',
        dobDay: '07',
        birthplace: 'New Orleans',
        nationality: 'usa',
        'person-type': 'Captain',
        'travel-document-number': '1234567890',
        'travel-document-type': 'Passport',
        'issuing-state': 'usa',
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
      firstName: req.body['first-name'],
      lastName: req.body['last-name'],
      gender: req.body.gender,
      dateOfBirth: '1937-06-07',
      placeOfBirth: req.body.birthplace,
      nationality: 'USA', // Check it upper cases it
      peopleType: req.body['person-type'],
      documentNumber: req.body['travel-document-number'],
      documentType: req.body['travel-document-type'],
      issuingState: 'USA', // Check it upper cases it
      documentExpiryDate: '2150-05-04',
    };

    personApiStub = sinon.stub(personApi, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with errors if surname is empty', () => {
    req.body['last-name'] = '';
    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(personApiStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/people/edit/index', {
        req,
        cookie,
        persontype,
        documenttype,
        genderchoice,
        errors: [
          new ValidationRule(validator.notEmpty, 'last-name', req.body['last-name'], 'Enter the surname of the person'),
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

    callController().then().then(() => {
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

    personApiStub.resolves(JSON.stringify({
      message: 'GAR not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
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

    callController().then().then(() => {
      expect(personApiStub).to.have.been.calledWith('9001', 'EDIT-PERSON-ID-1', person);
      expect(res.redirect).to.have.been.calledWith('/people');
      expect(res.render).to.not.have.been.called;
    });
  });
});
