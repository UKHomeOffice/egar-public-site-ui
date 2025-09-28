/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../../global.test.js';
import CookieModel from '../../../../common/models/Cookie.class.js';
import garApi from '../../../../common/services/garApi.js';
import controller from '../../../../app/garfile/manifest/deleteperson/post.controller.js';

describe('Person Delete Get Controller', () => {
  let req; let res;
  let garApiStub;
  let apiResponse;

  beforeEach(() => {
    chai.use(sinonChai);

    apiResponse = {
      firstName: 'Julian', lastName: 'Bashir',
    };

    req = {
      body: {},
      session: {
        gar: { id: '9001' },
      },
    };

    res = {
      redirect: sinon.spy(),
    };

    garApiStub = sinon.stub(garApi, 'deleteGarPeople');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect back if no deletePersonId', () => {
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.body.garPeopleId).to.be.undefined;
      expect(garApiStub).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
    });
  });

  it('should redirect back if api rejects', () => {
    req.body.garPeopleId = 'DELETE-PERSON-ID';
    garApiStub.rejects('personApi.getDetails Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiStub).to.have.been.calledWith('9001', ['DELETE-PERSON-ID']);
      expect(req.session.errMsg).to.eql({ message: 'Failed to delete GAR person. Try again' });
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
    });
  });

  it('should redirect with error messages if api returns one', () => {
    req.body.garPeopleId = 'DELETE-PERSON-ID';
    const cookie = new CookieModel(req);

    garApiStub.resolves(JSON.stringify({
      message: 'Person id not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiStub).to.have.been.calledWith('9001', ['DELETE-PERSON-ID']);
      expect(req.session.errMsg).to.eql({ message: 'Person id not found' });
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
    });
  });

  it('should redirect to people with success message if ok', () => {
    req.body.garPeopleId = 'DELETE-PERSON-ID';
    const cookie = new CookieModel(req);

    garApiStub.resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiStub).to.have.been.calledWith('9001', ['DELETE-PERSON-ID']);
      expect(req.session.successMsg).to.eq('Person removed from GAR');
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
    });
  });

  it('Deleting multiple is possible with multiple ids', () => {
    req.body.garPeopleId = ['DELETE-PERSON-ID', 'ANOTHER_DELETE_PERSON_ID'];
    const cookie = new CookieModel(req);

    garApiStub.resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiStub).to.have.been.calledWith('9001', ['DELETE-PERSON-ID', 'ANOTHER_DELETE_PERSON_ID']);
      expect(req.session.successMsg).to.eq('Person removed from GAR');
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
    });
  });
});
