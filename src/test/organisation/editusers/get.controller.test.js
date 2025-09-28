/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import roles from '../../../common/seeddata/egar_user_roles';
import orgApi from '../../../common/services/organisationApi.js';
import controller from '../../../app/organisation/editusers/get.controller.js';

describe('Organisation Edit Users Get Controller', () => {
  let req; let res; let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: { editUserId: 'EXAMPLE-EDIT-USER-ID', org: { i: 'ORGANISATION-ID-1' } },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    orgApiStub = sinon.stub(orgApi, 'getUserById');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('redirects if no id set', async () => {
    delete req.session.editUserId;

    await controller(req, res);

    expect(req.session.errMsg).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
    expect(res.render).to.not.have.been.called;
    expect(orgApiStub).to.not.have.been.called;
  });

  // org users
  it('should redirect with error message if api rejects', () => {
    orgApiStub.rejects('orgApiStub.getUsers Example Reject');
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.errMsg).to.eql({ message: 'Failed to find user details. Try again' });
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
      expect(res.render).to.not.have.been.called;
      expect(orgApiStub).to.have.been.calledOnceWithExactly('EXAMPLE-EDIT-USER-ID');
    });
  });

  it('should render with no users if no match', () => {
    const cookie = new CookieModel(req);

    orgApiStub.resolves(JSON.stringify({
      id: 'PERSON-1', userId: 'EXAMPLE-EDIT-USER-ID-2', role: { name: 'User' }  
    }));
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.errMsg).to.be.undefined;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.not.have.been.calledOnceWithExactly('app/organisation/editusers/index', {
        cookie,
        orgUser: [],
        roles,
      });
      expect(orgApiStub).to.have.been.calledOnceWithExactly('EXAMPLE-EDIT-USER-ID');
    });
  });

  it('should render with users if matches', () => {
    const cookie = new CookieModel(req);

    orgApiStub.resolves(JSON.stringify({
      id: 'PERSON-1', userId: 'EXAMPLE-EDIT-USER-ID-2', role: { name: 'User' },  
    }));
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.errMsg).to.be.undefined;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.not.have.been.calledOnceWithExactly('app/organisation/editusers/index', {
        cookie,
        orgUser: {
           id: 'PERSON-2', userId: 'EXAMPLE-EDIT-USER-ID', role: 'User' },
        roles,
      });
      expect(orgApiStub).to.have.been.calledOnceWithExactly('EXAMPLE-EDIT-USER-ID');
    });
  });
});
