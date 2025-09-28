/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import i18n from 'i18n';
import path from 'path';
import '../../global.test.js';
import craftApi from '../../../common/services/craftApi.js';
import garApi from '../../../common/services/garApi.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import pagination from '../../../common/utils/pagination.js';
import controller from '../../../app/garfile/craft/post.controller.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('GAR Craft Post Controller', () => {
  let req; let res; let paginationStub; let saveSessionStub;

  beforeEach(() => {
    chai.use(sinonChai);
    
    i18n.configure({
      locales: ['en'],
      directory: path.join(__dirname, '../../../locales'),
      objectNotation: true,
      defaultLocale: 'en',
      register: global,
    });

    req = {
      body: {
        registration: 'G-ABCD',
        craftType: 'Gulfstream',
        craftBasePort: 'LHR',
        portChoice: 'Yes'
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

    const callController = async () => {
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
      req.body.buttonClicked = 'Add to GAR';
      req.body.addCraft = 'ExampleCraft';
      craftApiStub = sinon.stub(craftApi, 'getDetails');
    });

    it('should redirect if api rejects', () => {
      const cookie = new CookieModel(req);
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
      const cookie = new CookieModel(req);
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
      req.body.craftBasePort = '';
      const cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(garApiPatchStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', {
          cookie,
          errors: [
            new ValidationRule(validator.notEmpty, 'craftBasePort', '', 'Enter an aircraft home port / location'),
          ],
        });
      });
    });

    
    it('should return an error if api rejects', () => {
      const cookie = new CookieModel(req);
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
      const cookie = new CookieModel(req);
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
      const cookie = new CookieModel(req);
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

    it('should go to the manifest screen if save and continue is buttonClicked even if addCraft is set', () => {
      req.body.addCraft = 'ExampleCraft';
      req.body.buttonClicked = 'Save and continue';
      const cookie = new CookieModel(req);
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
      const cookie = new CookieModel(req);
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
        expect(res.redirect).to.have.been.calledOnceWithExactly(307, '/garfile/view');
      });
    });
  });
});
