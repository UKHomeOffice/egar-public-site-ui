/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import craftApi from '../../../common/services/craftApi.js';
import controller from '../../../app/aircraft/edit/get.controller.js';

describe('Aircraft Edit Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        departureDate: null,
        departurePort: 'ZZZZ',
      },
      session: {},
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect back if no id set', async () => {
    await controller(req, res);

    expect(res.redirect).to.have.been.calledWith('/aircraft');
  });

  it('should redirect back if API rejects', () => {
    req.session.u = { dbId: 'ABCDEFGH' };
    req.session.editCraftId = '12345678';
    sinon.stub(craftApi, 'getDetails').rejects('craftApi.getDetails Example Reject');

    const callController = async () => {
      await controller(req, res);
    };
    callController().then(() => {
      expect(craftApi.getDetails).to.have.been.calledWith('ABCDEFGH', '12345678');
      expect(res.redirect).to.have.been.calledWith('/aircraft');
    });
  });

  it('should render the edit page with populated fields', () => {
    const editCraft = {
      registration: 'Z-YXWV', craftType: 'Hondajet', craftBase: 'LHR',
    };
    req.session.u = { dbId: 'ABCDEFGH' };
    req.session.editCraftId = '12345678';
    const cookie = new CookieModel(req);
    sinon.stub(craftApi, 'getDetails').resolves(JSON.stringify(editCraft));

    const callController = async () => {
      await controller(req, res);
    };
    callController().then(() => {
      cookie.setEditCraft(editCraft);
      expect(craftApi.getDetails).to.have.been.calledWith('ABCDEFGH', '12345678');
      expect(res.render).to.have.been.calledWith('app/aircraft/edit/index', { cookie });
    });
  });
});
