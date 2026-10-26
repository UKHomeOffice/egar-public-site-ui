/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/organisation/exportusers/get.controller');
const { organisationApi: orgApi } = require('../../../common/services/dataAccessApi');

describe('Organisation Export User Controller', () => {
  let req;
  let res;
  let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    clock = sinon.useFakeTimers({
      now: new Date('2024-03-14 GMT'),
      shouldAdvanceTime: false,
      toFake: ['Date'],
    });

    req = {
      body: {},
      session: {
        org: {
          i: 'ORG-ID-1',
          name: 'ORG-ID-1',
        },
        u: {
          rl: 'User',
        },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      setHeader: sinon.spy(),
      write: sinon.spy(),
      end: sinon.spy(),
    };

    orgApiStub = sinon.stub(orgApi, 'getUsers');
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`redirects with an export error without sending CSV on a ${type}`, async () => {
      req.session.save = sinon.stub().callsArg(0);
      orgApiStub.rejects(Object.assign(new Error('Request failed'), { type, status: 503 }));

      await controller(req, res);

      expect(req.session.errMsg).to.deep.equal({ message: 'Failed to export organisation users. Try again' });
      expect(req.session.save).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
      expect(res.setHeader).not.to.have.been.called;
      expect(res.write).not.to.have.been.called;
      expect(res.end).not.to.have.been.called;
    });
  });

  describe('api returns ok', () => {
    let cookie;

    const apiResponse = {
      items: [
        {
          userId: 'USER-1',
          firstName: 'Jessica',
          lastName: 'Person',
          email: 'jp@test.com',
          role: { name: 'Admin' },
        },
        {
          userId: 'USER-2',
          firstName: 'Trish',
          lastName: 'Ity',
          email: 'tp@test.com',
          role: { name: 'Manager' },
        },
      ],
    };

    beforeEach(() => {
      cookie = new CookieModel(req);
      cookie.setOrganisationUsers(apiResponse);
      orgApiStub.resolves(apiResponse);
    });

    it('should display success message if set', () => {
      const callController = async () => {
        await controller(req, res);
      };

      return callController().then(() => {
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORG-ID-1', 1, 999999999999999);
        expect(res.setHeader).to.have.been.calledWith(
          'Content-disposition',
          'attachment; filename=ORG-ID-1-users-2024-03-14.csv'
        );
        expect(res.setHeader).to.have.been.calledWith('Content-Type', 'text/csv');
        expect(res.write).to.have.been.calledWith('Id,First Name,Last Name,Email,Role,State\n');
        expect(res.write).to.have.been.calledWith(
          'USER-1,Jessica,Person,jp@test.com,Admin,\nUSER-2,Trish,Ity,tp@test.com,Manager,\n'
        );
        expect(res.end).to.have.been.called;
      });
    });
  });
});
