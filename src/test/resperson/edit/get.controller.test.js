const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const resPersonApi = require('../../../common/services/resPersonApi');
const controller = require('../../../app/resperson/edit/get.controller');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const utils = require('../../../common/utils/utils');

chai.use(sinonChai);

describe('Responsible Person Edit Get Controller', () => {
  let req;
  let res;
  let getResPersonStub;
  let sessionSaveStub;
  let responsiblePerson;

  beforeEach(() => {
    req = {
      query: {
        editResponsiblePerson: 'EDIT-ID',
      },
      session: {
        u: { dbId: '343' },
        save: (callback) => callback(),
      },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };
    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
    getResPersonStub = sinon.stub(resPersonApi, 'getResPersonDetails');
  });
  req = {
    body: {
      responsibleGivenName: 'Benjamin',
      responsibleSurname: 'Sisko',
      responsibleContactNo: '07878787878',
      responsibleEmail: 'testmail@test.com',
      responsibleAddressLine1: 'Add Line 1',
      responsibleAddressLine2: 'Add Line 2',
      responsibleTown: 'London',
      responsibleCountry: 'USA',
      responsiblePostcode: 'HN77NH',
      fixedBasedOperator: 'Captain',
    },
  };
  responsiblePerson = utils.getResponsiblePersonFromReq(req);

  afterEach(() => {
    sinon.restore();
  });

  it('edit should redirect if responsiblePersonId is undefined', async () => {
    delete req.query.editResponsiblePerson;

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(getResPersonStub).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/resperson');
      });
  });

  it('should redirect with error if resPersonAPI rejects', async () => {
    req.session.editResponsiblePersonId = 'EDIT-ID';

    getResPersonStub.rejects('getResPersonDetails Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(getResPersonStub).to.have.been.calledWith('343', 'EDIT-ID');
        expect(req.session.errMsg).to.eql({ message: 'Failed to get responsible person details' });
        expect(sessionSaveStub).to.have.been.calledOnce;
        expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
      });
  });

  it('should render index page when api resolve responsible person', async () => {
    req.session.editResponsiblePersonId = 'EDIT-ID';
    const cookie = new CookieModel(req);

    getResPersonStub.resolves(JSON.stringify(responsiblePerson));

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(getResPersonStub).to.have.been.calledWith('343', 'EDIT-ID');
        expect(res.render).to.have.been.calledWith('app/resperson/edit/index', {
          cookie,
          responsiblePerson,
          fixedBasedOperatorOptions,
        });
      });
  });
});
