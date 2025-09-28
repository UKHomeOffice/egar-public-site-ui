/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import persontype from '../../../common/seeddata/egar_type_of_saved_person.json' with {type: "json"};
import documenttype from '../../../common/seeddata/egar_saved_people_travel_document_type.json' with { type: "json"};
import genderchoice from '../../../common/seeddata/egar_gender_choice.json' with { type: "json"};
import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import personApi from '../../../common/services/personApi.js';
import controller from '../../../app/people/add/post.controller.js';

describe('Person Add Post Controller', () => {
  let req; let res; let person; let personApiStub;

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
        u: { dbId: '90210' },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    person = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      nationality: 'USA', // Check it upper cases it
      placeOfBirth: req.body.birthplace,
      gender: req.body.gender,
      peopleType: req.body.personType,
      documentNumber: req.body.travelDocumentNumber,
      documentType: req.body.travelDocumentType,
      issuingState: 'USA', // Check it upper cases it
      documentExpiryDate: `${req.body.expiryYear}-${req.body.expiryMonth}-${req.body.expiryDay}`,
      dateOfBirth: `${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`,
      documentDesc: req.body.travelDocumentOther,
    };

    personApiStub = sinon.stub(personApi, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with errors if surname is empty', () => {
    req.body.lastName = '';
    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(personApiStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/people/add/index', {
        req,
        cookie,
        persontype,
        documenttype,
        genderchoice,
        person: req.body,
        errors: [
          new ValidationRule(validator.isNotEmpty, 'lastName', req.body.lastName, 'Enter the surname of the person'),
        ],
      });
    });
  });

  it('should render with messages if gar api rejects', () => {
    const cookie = new CookieModel(req);
    personApiStub.rejects('personApi.create Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(personApiStub).to.have.been.calledWith('90210', { people: [ person ] });
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/people/add/index', {
        cookie,
        persontype,
        documenttype,
        genderchoice,
        errors: [{ message: 'There was a problem creating the person. Please try again' }],
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
      expect(personApiStub).to.have.been.calledWith('90210', { people: [person] });
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWith('app/people/add/index', {
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
      expect(personApiStub).to.have.been.calledWith('90210',{ people: [ person ] });
      expect(res.redirect).to.have.been.calledWith('/people');
      expect(res.render).to.not.have.been.called;
    });
  });
});
