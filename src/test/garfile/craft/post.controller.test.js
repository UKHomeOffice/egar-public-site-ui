/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const craftApi = require('../../../common/services/craftApi');
const garApi = require('../../../common/services/garApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const pagination = require('../../../common/utils/pagination');

const controller = require('../../../app/garfile/craft/post.controller');

describe('GAR Craft Post Controller', () => {
  let req; let res; let paginationStub; let saveSessionStub;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      body: {
        craftReg: 'G-ABCD',
        craftType: 'Gulfstream',
        craftBase: 'LHR',
      },
      session: {
        gar: { id: 'GAR1-ID', status: 'Draft', craft: {} },
        u: { dbId: 'USER1-ID' },
        cookie: {},
        save: callback => callback(),
      },
    };
    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };
    paginationStub = sinon.stub(pagination, 'setCurrentPage');
    saveSessionStub = sinon.stub(req.session, 'save').callsArg(0);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect if nextPage found', () => {
    req.body.nextPage = 6;

    callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(paginationStub).to.have.been.called;
      expect(saveSessionStub).to.have.been.called;
    }).then(() => {
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/craft#saved_aircraft');
    });
  });

  describe('add craft', () => {
    let craftApiStub;

    beforeEach(() => {
      req.body.addCraft = 'ExampleCraft';
      craftApiStub = sinon.stub(craftApi, 'getDetails');
    });

    it('should redirect if api rejects', () => {
      cookie = new CookieModel(req);
      craftApiStub.rejects('craftApi.getDetails Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(craftApiStub).to.have.been.calledWith('USER1-ID', 'ExampleCraft');
        expect(res.redirect).to.have.been.calledWith('/garfile/craft');
      });
    });

    it('should set the craft and redirect', () => {
      const craftResponse = {
        registration: 'E-GETC',
        craftType: 'Airbus A380',
        craftBase: 'LAX',
      };
      cookie = new CookieModel(req);
      cookie.setGarCraft(craftResponse.registration, craftResponse.craftType, craftResponse.craftBase);
      craftApiStub.resolves(JSON.stringify(craftResponse));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(craftApiStub).to.have.been.calledWith('USER1-ID', 'ExampleCraft');
        expect(res.redirect).to.have.been.calledWith('/garfile/craft');
      });
    });
  });

  describe('edit craft', () => {
    let garApiPatchStub;

    beforeEach(() => {
      garApiPatchStub = sinon.stub(garApi, 'patch');
    });

    it('should return errors on validation', () => {
      req.body.craftBase = '';
      cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(garApiPatchStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', {
          cookie,
          errors: [
            new ValidationRule(validator.notEmpty, 'craftBase', '', 'Enter an aircraft home port / location'),
          ],
        });
      });
    });

    it('should return an error if api rejects', () => {
      cookie = new CookieModel(req);
      garApiPatchStub.rejects('garApi.patch Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(garApiPatchStub).to.have.been.calledWith('GAR1-ID', 'Draft', {
          registration: 'G-ABCD',
          craftType: 'Gulfstream',
          craftBase: 'LHR',
        });
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', {
          cookie, errors: [{ message: 'Failed to add aircraft to GAR' }],
        });
      });
    });

    it('should return an error message if api returns a message', () => {
      cookie = new CookieModel(req);
      garApiPatchStub.resolves(JSON.stringify({
        message: 'Craft does not exist',
      }));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(garApiPatchStub).to.have.been.calledWith('GAR1-ID', 'Draft', {
          registration: 'G-ABCD',
          craftType: 'Gulfstream',
          craftBase: 'LHR',
        });
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', {
          cookie, errors: [{ message: 'Craft does not exist' }],
        });
      });
    });

    it('should go to the manifest screen if save and continue is buttonClicked', () => {
      req.body.buttonClicked = 'Save and continue';
      cookie = new CookieModel(req);
      garApiPatchStub.resolves(JSON.stringify({}));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(garApiPatchStub).to.have.been.calledWith('GAR1-ID', 'Draft', {
          registration: 'G-ABCD',
          craftType: 'Gulfstream',
          craftBase: 'LHR',
        });
        expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
      });
    });
    // success button clicked save and continue
    it('should go to the dashboard if buttonClicked is not set', () => {
      cookie = new CookieModel(req);
      garApiPatchStub.resolves(JSON.stringify({}));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(garApiPatchStub).to.have.been.calledWith('GAR1-ID', 'Draft', {
          registration: 'G-ABCD',
          craftType: 'Gulfstream',
          craftBase: 'LHR',
        });
        expect(res.redirect).to.have.been.calledWith('/home');
      });
    });
    // success redirect home
  });
});
