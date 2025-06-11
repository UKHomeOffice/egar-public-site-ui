/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const craftApi = require('../../../common/services/craftApi');
const personApi = require('../../../common/services/personApi');

const controller = require('../../../app/user/viewDetails/get.controller');

// TODO: Most of this logic handles obtaining craft and people, which are not
// displayed on the resulting template! These unit tests are to reduce
// regressions should any code end up not running.
describe('User View Details Get Controller', () => {
  let req; let res;
  let craftApiStub; let personApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      session: {
        u: { dbId: 'USER-ID-1' },
      },
    };

    res = {
      render: sinon.spy(),
    };

    craftApiStub = sinon.stub(craftApi, 'getCrafts');
    personApiStub = sinon.stub(personApi, 'getPeople');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect with errors if api rejects', () => {
    const cookie = new CookieModel(req);
    //craftApiStub.rejects('craftApi.getCrafts Example Reject');
    personApiStub.resolves();

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      //expect(craftApiStub).to.have.been.calledOnceWithExactly('USER-ID-1');
      expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
      expect(res.render).to.have.been.calledOnceWithExactly('app/user/viewDetails/old_index', {
        cookie,
        errors: [{ message: 'There was a problem fetching data' }],
      });
    });
  });

  describe('api returns ok', () => {
    let cookie;

    const personApiResponse = {
      items: [
        { id: 'PERSON-1', firstName: 'Jessica' },
        { id: 'PERSON-2', firstName: 'Trish' },
      ],
    };

    const craftApiResponse = {
      items: [
        { registration: 'G-ABCD', craftType: 'Hondajet', craftBase: 'OXF' },
      ],
    };

    beforeEach(() => {
      cookie = new CookieModel(req);
      cookie.setSavedCraft(craftApiResponse);

      craftApiStub.resolves(JSON.stringify(craftApiResponse));
      personApiStub.resolves(JSON.stringify(personApiResponse));
    });

    it('should display error message if set', () => {
      req.session.errMsg = { message: 'Example error message' };

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        //expect(craftApiStub).to.have.been.calledOnceWithExactly('USER-ID-1');
        expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
        expect(res.render).to.have.been.calledOnceWithExactly('app/user/viewDetails/old_index', {
          cookie,
          // savedCrafts: {
          //   items: [
          //     { registration: 'G-ABCD', craftType: 'Hondajet', craftBase: 'OXF' },
          //   ],
          // },
          savedPeople: {
            items: [
              { id: 'PERSON-1', firstName: 'Jessica' },
              { id: 'PERSON-2', firstName: 'Trish' },
            ],
          },
          errors: [{ message: 'Example error message' }],
        });
      });
    });

    it('should display success message if set', () => {
      req.session.successHeader = 'Successful header';
      req.session.successMsg = 'Example success message';

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        //expect(craftApiStub).to.have.been.calledOnceWithExactly('USER-ID-1');
        expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
        expect(res.render).to.have.been.calledOnceWithExactly('app/user/viewDetails/old_index', {
          cookie,
          // savedCrafts: {
          //   items: [
          //     { registration: 'G-ABCD', craftType: 'Hondajet', craftBase: 'OXF' },
          //   ],
          // },
          savedPeople: {
            items: [
              { id: 'PERSON-1', firstName: 'Jessica' },
              { id: 'PERSON-2', firstName: 'Trish' },
            ],
          },
          successHeader: 'Successful header',
          successMsg: 'Example success message',
        });
      });
    });

    it('should redirect with no messages if no parameters', () => {
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        //expect(craftApiStub).to.have.been.calledOnceWithExactly('USER-ID-1');
        expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
        expect(res.render).to.have.been.calledOnceWithExactly('app/user/viewDetails/old_index', {
          cookie,
          // savedCrafts: {
          //   items: [
          //     { registration: 'G-ABCD', craftType: 'Hondajet', craftBase: 'OXF' },
          //   ],
          // },
          savedPeople: {
            items: [
              { id: 'PERSON-1', firstName: 'Jessica' },
              { id: 'PERSON-2', firstName: 'Trish' },
            ],
          },
        });
      });
    });
  });
});
