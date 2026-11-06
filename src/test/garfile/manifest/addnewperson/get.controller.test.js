const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../../global.test');
const CookieModel = require('../../../../common/models/Cookie.class');
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const { personApi } = require('../../../../common/services/dataAccessApi');

const controller = require('../../../../app/garfile/manifest/addnewperson/get.controller');

describe('GAR Manifest Add Person Get Controller', () => {
  let req;
  let res;
  let personApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: { dbId: 'ABCDEFGH' },
      },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    personApiStub = sinon.stub(personApi, 'getPeople');
  });

  afterEach(() => {
    sinon.restore();
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`redirects without clearing the selected ID on a ${type}`, async () => {
      req.session.addPersonId = 'PERSON-1';
      personApiStub.rejects(
        Object.assign(new Error('Request failed'), { type, status: 503, body: { message: 'Unavailable' } })
      );

      await controller(req, res);

      expect(req.session.addPersonId).to.equal('PERSON-1');
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
      expect(res.render).not.to.have.been.called;
    });
  });

  it('should render the appropriate page if addPersonId not set', async () => {
    const cookie = new CookieModel(req);

    await controller(req, res);

    expect(personApiStub).to.not.have.been.called;
    expect(res.redirect).to.not.have.been.called;
    expect(res.render).to.have.been.calledWith('app/garfile/manifest/addnewperson/index', {
      cookie,
      genderchoice,
      persontype,
      documenttype,
      req,
      person: {},
    });
  });

  it('should redirect if api rejects', () => {
    req.session.addPersonId = 'PERSON-1';
    personApiStub.rejects('personApi.getPeople Example Reject');
    const callController = async () => {
      await controller(req, res);
    };

    return callController().then(() => {
      expect(personApiStub).to.have.been.calledOnceWithExactly('ABCDEFGH', 'individual');
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
      expect(res.render).to.not.have.been.called;
    });
  });

  it('should render page if ok', () => {
    const cookie = new CookieModel(req);
    req.session.addPersonId = 'PERSON-1';

    personApiStub.resolves([
      {
        personId: 'PERSON-1',
        firstName: 'Christopher',
        lastName: 'Pike',
        peopleType: { name: 'Captain' },
      },
      {
        personId: 'PERSON-2',
        firstName: 'James',
        lastName: 'Kirk',
        peopleType: { name: 'Captain' },
      },
    ]);
    const callController = async () => {
      await controller(req, res);
    };

    return callController().then(() => {
      expect(personApiStub).to.have.been.calledOnceWithExactly('ABCDEFGH', 'individual');
      expect(req.session.addPersonId).to.be.undefined;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/manifest/addnewperson/index', {
        cookie,
        persontype,
        documenttype,
        genderchoice,
        req,
        person: {
          personId: 'PERSON-1',
          firstName: 'Christopher',
          lastName: 'Pike',
          peopleType: 'Captain',
        },
      });
    });
  });
  // TODO: No unhappy path handling
});
