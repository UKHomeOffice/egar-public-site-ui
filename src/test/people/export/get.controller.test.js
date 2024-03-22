/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/people/export/get.controller');
const personApi = require('../../../common/services/personApi');

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
          dbId: 'USER-ID'
        }
      },
    };

    res = {
      render: sinon.spy(),
      setHeader: sinon.spy(),
      write: sinon.spy(),
      end: sinon.spy(),
    };

    personApiStub = sinon.stub(personApi, 'getPeople');
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  describe('api returns ok', () => {
    let cookie;

    const apiResponse = [
      {
        personId: '1', peopleType: { name: 'Captain' }, firstName: 'James', lastName: 'Kirk', gender: 'male', dateOfBirth: '01/01/2024', nationality: 'GBR', documentType: 'passport', documentNumber: '010101010', documentExpiryDate: '01/01/2025', issuingState: 'GBR'
      },
      {
        personId: '2', peopleType: { name: 'Crew' }, firstName: 'S\'chn T\'gai', lastName: 'Spock', gender: 'female', dateOfBirth: '01/05/2024', nationality: 'GBR', documentType: 'passport', documentNumber: '1234', documentExpiryDate: '05/01/2025', issuingState: 'FRA'
      },
    ];

    beforeEach(() => {
      cookie = new CookieModel(req);
      cookie.setOrganisationUsers(apiResponse);
      personApiStub.resolves(JSON.stringify(apiResponse));
    });

    it('should display success message if set', () => {

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then(() => {
          expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID', 'individual');
          expect(res.setHeader).to.have.been.calledWith('Content-disposition', 'attachment; filename=people-2024-03-14.csv');
          expect(res.setHeader).to.have.been.calledWith('Content-Type', 'text/csv');
          expect(res.write).to.have.been.calledWith('Id,First Name,Last Name,Gender,DoB,Nationality,Doc Type,Doc Number,Doc Expiry,Doc Issuing State,Type\n');
          expect(res.write).to.have.been.calledWith('1,James,Kirk,male,01/01/2024,GBR,passport,010101010,01/01/2025,GBR,Captain\n2,S\'chn T\'gai,Spock,female,01/05/2024,GBR,passport,1234,05/01/2025,FRA,Crew\n');
          expect(res.end).to.have.been.called;
        });
    });

  });

});