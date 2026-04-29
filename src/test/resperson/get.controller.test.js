const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../global.test');
const CookieModel = require('../../common/models/Cookie.class');
const resPersonApi = require('../../common/services/resPersonApi');

const controller = require('../../app/resperson/get.controller');

const responsible_persons = [
  {
    responsiblePersonId: 'bc45f7d8-75e4-484d-9422-4a7c864e6bc9',
    responsibleGivenName: 'Sally',
    responsibleSurname: 'Smith',
    responsibleContactNo: '07878787878',
    responsibleEmail: 'testmail@181test.com',
    responsibleAddressLine1: 'House44',
    responsibleAddressLine2: 'Street33',
    responsibleTown: 'London',
    responsibleCountry: 'GBR',
    responsiblePostcode: 'GB66BG',
    fixedBasedOperator: 'Captain',
    fixedBasedOperatorAnswer: '',
  },
  {
    responsiblePersonId: '20bdec29-2a5d-41be-babe-906c80f5335c',
    responsibleGivenName: 'John',
    responsibleSurname: 'Smith',
    responsibleContactNo: '07878787878',
    responsibleEmail: 'testmail@816test.com',
    responsibleAddressLine1: 'House44',
    responsibleAddressLine2: 'Street33',
    responsibleTown: 'London',
    responsibleCountry: 'GBR',
    responsiblePostcode: 'GB66BG',
    fixedBasedOperator: 'Captain',
    fixedBasedOperatorAnswer: '',
  },
];

describe('Responsible Person Index Get Controller', () => {
  let req;
  let res;
  let clock;
  const APRIL = 3;

  beforeEach(() => {
    chai.use(sinonChai);
    clock = sinon.useFakeTimers({
      now: new Date(2023, APRIL, 11),
      shouldAdvanceTime: false,
      toFake: ['Date'],
    });

    req = {
      session: {
        u: { dbId: 'USER-DB-ID-1' },
      },
    };
    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
    clock.restore();
  });

  it('1. should render with error if responsiblePerson api rejects', () => {
    const cookie = new CookieModel(req);
    sinon.stub(resPersonApi, 'getResPersons').rejects('getResPerson Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(resPersonApi.getResPersons).to.have.been.calledWith('USER-DB-ID-1');
      expect(res.render).to.have.been.calledWith('app/resperson/index', {
        cookie,
        errors: [{ message: 'Failed to get saved responsible persons' }],
      });
    });
  });

  it('2. should render the message if api returns a message response', () => {
    const cookie = new CookieModel(req);
    const resPersons = { message: 'User not registered' };
    sinon.stub(resPersonApi, 'getResPersons').resolves(JSON.stringify(resPersons));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(resPersonApi.getResPersons).to.have.been.calledWith('USER-DB-ID-1');
      expect(res.render).to.have.been.calledWith('app/resperson/index', {
        cookie,
        resPersons: [],
        errors: [{ message: 'Failed to get saved responsible persons' }],
      });
    });
  });

  it('3. should render the error if any error present in the session', () => {
    const cookie = new CookieModel(req);
    req.session.errMsg = { message: 'Example Error Message' };
    sinon.stub(resPersonApi, 'getResPersons').resolves({ message: 'User not registered' });

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(resPersonApi.getResPersons).to.have.been.calledWith('USER-DB-ID-1');
      expect(res.render).to.have.been.calledWith('app/resperson/index', {
        cookie,
        errors: [{ message: 'Failed to get saved responsible persons' }],
      });
    });
  });

  it('4. should render the success message if any present in the session', () => {
    const cookie = new CookieModel(req);
    req.session.successMsg = 'Responsible person is deleted';
    req.session.successHeader = 'success';
    const { successMsg, successHeader } = req.session;
    sinon.stub(resPersonApi, 'getResPersons').resolves(JSON.stringify(responsible_persons));

    const callController = async () => {
      await controller(req, res);
    };
    callController().then(() => {
      expect(resPersonApi.getResPersons).to.have.been.calledWith('USER-DB-ID-1');
      expect(res.render).to.have.been.calledWith('app/resperson/index', {
        cookie,
        resPersons: responsible_persons,
        successMsg,
        successHeader,
      });
    });
  });

  it('5. should render page with responsible persons on happy path', () => {
    const cookie = new CookieModel(req);
    sinon.stub(resPersonApi, 'getResPersons').resolves(JSON.stringify(responsible_persons));

    const callController = async () => {
      await controller(req, res);
    };
    callController().then(() => {
      expect(resPersonApi.getResPersons).to.have.been.calledWith('USER-DB-ID-1');
      expect(res.render).to.have.been.calledWith('app/resperson/index', {
        cookie,
        resPersons: responsible_persons,
      });
    });
  });
});
