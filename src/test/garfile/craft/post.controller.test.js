const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const { garApi, craftApi } = require('../../../common/services/dataAccessApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const pagination = require('../../../common/utils/pagination');
const controller = require('../../../app/garfile/craft/post.controller');

describe('GAR Craft Post Controller', () => {
  let req;
  let res;
  let cookie;
  let patch;
  let craftDetails;
  let save;

  beforeEach(() => {
    req = {
      body: {
        registration: 'G-ABCD',
        craftType: 'Gulfstream',
        craftBasePort: 'LHR',
        portChoice: 'Yes',
      },
      session: {
        gar: { id: 'GAR1-ID', status: 'Draft', craft: {} },
        u: { dbId: 'USER1-ID' },
        save: sinon.stub().callsArg(0),
      },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      locals: { gar: { garId: 'GAR1-ID' } },
    };
    cookie = new CookieModel(req);
    save = req.session.save;
    patch = sinon.stub(garApi, 'patch').resolves({});
    craftDetails = sinon.stub(craftApi, 'getDetails');
  });

  afterEach(() => sinon.restore());

  function expectError(message) {
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/craft/index', {
      cookie,
      errors: [{ message }],
    });
  }

  it('saves the selected pagination and redirects without updating aircraft', async () => {
    req.body.nextPage = 6;
    const setPage = sinon.stub(pagination, 'setCurrentPage');

    await controller(req, res);

    expect(setPage).to.have.been.calledOnceWithExactly(req, '/garfile/craft', 6);
    expect(save).to.have.been.calledOnce;
    expect(save).to.have.been.calledBefore(res.redirect);
    expect(patch).not.to.have.been.called;
    expect(craftDetails).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/craft#saved_aircraft');
  });

  describe('selecting saved aircraft', () => {
    beforeEach(() => {
      req.body.buttonClicked = 'Add to GAR';
      req.body.addCraft = 'ExampleCraft';
    });

    it('redirects without changing the selected craft when the lookup fails', async () => {
      cookie.setGarCraft('G-OLD', 'Hondajet', 'LHR');
      const previousCraft = { ...cookie.getGarCraft() };
      craftDetails.rejects(new Error('Aircraft unavailable'));

      await controller(req, res);

      expect(craftDetails).to.have.been.calledOnceWithExactly('USER1-ID', 'ExampleCraft');
      expect(cookie.getGarCraft()).to.deep.equal(previousCraft);
      expect(save).not.to.have.been.called;
      expect(patch).not.to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/craft');
    });

    it('sets the decoded aircraft in the session before redirecting', async () => {
      const craft = { registration: 'E-GETC', craftType: 'Airbus A380', craftBase: 'LAX' };
      craftDetails.resolves(craft);

      await controller(req, res);

      expect(cookie.getGarCraft()).to.include(craft);
      expect(craftDetails).to.have.been.calledOnceWithExactly('USER1-ID', 'ExampleCraft');
      expect(save).to.have.been.calledOnce;
      expect(save).to.have.been.calledBefore(res.redirect);
      expect(patch).not.to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/craft');
    });
  });

  describe('saving GAR aircraft', () => {
    it('renders validation errors without updating the GAR', async () => {
      req.body.craftBasePort = '';

      await controller(req, res);

      expect(patch).not.to.have.been.called;
      expect(res.redirect).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/craft/index', {
        cookie,
        errors: [new ValidationRule(validator.notEmpty, 'craftBasePort', '', 'Enter an aircraft home port / location')],
      });
    });

    it('renders an error when updating the GAR fails', async () => {
      patch.rejects(new Error('GAR unavailable'));
      await controller(req, res);
      expectError('Failed to add aircraft to GAR');
    });

    it('preserves the backend message on an HTTP rejection', async () => {
      patch.rejects(
        Object.assign(new Error('Bad Request'), {
          type: 'http_error',
          status: 400,
          body: { message: 'GAR does not exist' },
        })
      );
      await controller(req, res);
      expectError('GAR does not exist');
    });

    it('renders a decoded API message rather than continuing', async () => {
      patch.resolves({ message: 'Craft does not exist' });
      await controller(req, res);
      expectError('Craft does not exist');
    });

    it('saves entered aircraft against the verified GAR and continues even with a saved-aircraft selection', async () => {
      req.body.addCraft = 'ExampleCraft';
      req.body.buttonClicked = 'Save and continue';
      req.session.gar.id = 'stale-session-id';

      await controller(req, res);

      expect(craftDetails).not.to.have.been.called;
      expect(patch).to.have.been.calledOnceWithExactly('GAR1-ID', 'Draft', {
        registration: 'G-ABCD',
        craftType: 'Gulfstream',
        craftBase: 'LHR',
      });
      expect(cookie.getGarCraft()).to.include({
        registration: 'G-ABCD',
        craftType: 'Gulfstream',
        craftBase: 'LHR',
      });
      expect(res.render).not.to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
    });

    it('saves a coordinate home location and returns to the GAR view', async () => {
      req.body.portChoice = 'No';
      req.body.craftBaseLat = '45.100000';
      req.body.craftBaseLong = '12.100000';

      await controller(req, res);

      expect(patch).to.have.been.calledOnceWithExactly('GAR1-ID', 'Draft', {
        registration: 'G-ABCD',
        craftType: 'Gulfstream',
        craftBase: '45.100000 12.100000',
      });
      expect(res.render).not.to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly(307, '/garfile/view');
    });
  });
});
