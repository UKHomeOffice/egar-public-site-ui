/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const persontype = require('../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../common/seeddata/egar_gender_choice.json');
const personApi = require('../../../common/services/personApi');

const controller = require('../../../app/people/edit/get.controller');

describe('Person Edit Get Controller', () => {
  let req; let res; let personApiStub; let apiResponse;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    apiResponse = {
      firstName: 'Julian', lastName: 'Bashir',
    };

    req = {
      session: {
        u: { dbId: '343' },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    personApiStub = sinon.stub(personApi, 'getDetails');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect back if no editPersonId', () => {
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApiStub).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/people');
      expect(res.render).to.not.have.been.called;
    });
  });

  it('should redirect back if api rejects', () => {
    req.session.editPersonId = 'EDIT-PERSON-ID';
    personApiStub.rejects('personApi.getDetails Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApiStub).to.have.been.calledWith('343', 'EDIT-PERSON-ID');
      expect(res.redirect).to.have.been.calledOnceWithExactly('/people');
      expect(res.render).to.not.have.been.called;
    });
  });

  it('should render with error messages if api returns one', () => {
    req.session.editPersonId = 'EDIT-PERSON-ID';
    cookie = new CookieModel(req);

    personApiStub.resolves(JSON.stringify({
      message: 'Person id not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApiStub).to.have.been.calledWith('343', 'EDIT-PERSON-ID');
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/people/edit/index', {
        cookie, persontype, documenttype, genderchoice, errors: [{ message: 'Failed to get person information' }],
      });
    });
  });

  it('should render edit page if ok', () => {
    req.session.editPersonId = 'EDIT-PERSON-ID';
    cookie = new CookieModel(req);

    personApiStub.resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApiStub).to.have.been.calledWith('343', 'EDIT-PERSON-ID');
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/people/edit/index', {
        cookie, persontype, documenttype, genderchoice, person: apiResponse,
      });
    });
  });
});
