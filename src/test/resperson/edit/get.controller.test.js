const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const { resPersonApi } = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/resperson/edit/get.controller');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');

describe('Responsible Person Edit Get Controller', () => {
  let req;
  let res;
  let getStub;
  let saveStub;

  beforeEach(() => {
    req = {
      query: { editResponsiblePerson: 'person-1' },
      session: { u: { dbId: 'user-1' }, save: (callback) => callback() },
    };
    res = { redirect: sinon.spy(), render: sinon.spy() };
    saveStub = sinon.stub(req.session, 'save').callsArg(0);
    getStub = sinon.stub(resPersonApi, 'getResPersonDetails');
  });

  afterEach(() => sinon.restore());

  it('redirects without calling the API if no ID is supplied', async () => {
    delete req.query.editResponsiblePerson;

    await controller(req, res);

    expect(getStub).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
  });

  it('renders the responsible-person object and stores the editing ID', async () => {
    const responsiblePerson = { responsiblePersonId: 'person-1', responsibleGivenName: 'Benjamin' };
    getStub.resolves(responsiblePerson);

    await controller(req, res);

    expect(getStub).to.have.been.calledOnceWithExactly('user-1', 'person-1');
    expect(req.session.editResponsiblePersonId).to.equal('person-1');
    expect(res.render).to.have.been.calledOnceWithExactly('app/resperson/edit/index', {
      cookie: new CookieModel(req),
      responsiblePerson,
      fixedBasedOperatorOptions,
    });
    expect(res.redirect).not.to.have.been.called;
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`saves an error and redirects on a ${type}`, async () => {
      getStub.rejects(
        Object.assign(new Error('Request failed'), { type, status: 404, body: { message: 'Person not found' } })
      );

      await controller(req, res);

      expect(getStub).to.have.been.calledOnceWithExactly('user-1', 'person-1');
      expect(req.session.errMsg).to.deep.equal({ message: 'Failed to get responsible person details' });
      expect(saveStub).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
      expect(res.render).not.to.have.been.called;
    });
  });
});
