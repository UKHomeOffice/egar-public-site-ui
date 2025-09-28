/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import controller from '../../../app/organisation/exportusers/get.controller.js';
import orgApi from '../../../common/services/organisationApi.js';

describe('Organisation Export User Controller', () => {
  let req; let res; let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    clock = sinon.useFakeTimers({
      now: new Date('2024-03-14 GMT'),
      shouldAdvanceTime: false,
      toFake: ["Date"],
    });

    req = {
      body: {},
      session: {
        org: {
          i: 'ORG-ID-1',
          name: 'ORG-ID-1'
        },
        u: {
          rl: "User"
        }
      },
    };

    res = {
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

  describe('api returns ok', () => {
    let cookie;

    const apiResponse = {
      items: [
        { userId: 'USER-1', firstName: 'Jessica', lastName: 'Person', email: 'jp@test.com', role: { name: "Admin" } },
        { userId: 'USER-2', firstName: 'Trish', lastName: 'Ity', email: 'tp@test.com', role: { name: "Manager" } },
      ],
    };

    beforeEach(() => {
      cookie = new CookieModel(req);
      cookie.setOrganisationUsers(apiResponse);
      orgApiStub.resolves(JSON.stringify(apiResponse));
    });

    it('should display success message if set', () => {
      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then(() => {
          expect(orgApiStub).to.have.been.calledOnceWithExactly('ORG-ID-1', 1, 999999999999999 );
          expect(res.setHeader).to.have.been.calledWith('Content-disposition', 'attachment; filename=ORG-ID-1-users-2024-03-14.csv');
          expect(res.setHeader).to.have.been.calledWith('Content-Type', 'text/csv');
          expect(res.write).to.have.been.calledWith('Id,First Name,Last Name,Email,Role,State\n');
          expect(res.write).to.have.been.calledWith('USER-1,Jessica,Person,jp@test.com,Admin,\nUSER-2,Trish,Ity,tp@test.com,Manager,\n');
          expect(res.end).to.have.been.called;
        });
    });

  });

});
