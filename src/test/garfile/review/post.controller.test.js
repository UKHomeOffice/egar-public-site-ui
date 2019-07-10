/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

const controller = require('../../../app/garfile/review/post.controller');

describe('Arrival Post Controller', () => {
  let req; let res;
  let garApiGetStub; let garApiGetPeopleStub; let garApiGetSupportingDocsStub;
  let sessionSaveStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        arrivalPort: 'LHR',
        arrivalLat: '45.1000',
        arrivalLong: '12.1000',
        arrivalDay: '30',
        arrivalMonth: '5',
        arrivalYear: '2020',
        arrivalHour: '15',
        arrivalMinute: '00',
      },
      session: {
        gar: {
          id: 'ABCDE',
        },
        submiterrormessage: [],
        save: callback => callback(),
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
    garApiGetStub = sinon.stub(garApi, 'get');
    garApiGetPeopleStub = sinon.stub(garApi, 'getPeople');
    garApiGetSupportingDocsStub = sinon.stub(garApi, 'getSupportingDocs');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do nothing if retrieving a gar causes an issue', () => {
    const cookie = new CookieModel(req);
    garApiGetStub.resolves();
    garApiGetPeopleStub.resolves();
    garApiGetSupportingDocsStub.rejects('garApi.getSupportingDocs Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(cookie.getGarId()).to.eq('ABCDE');
      expect(garApiGetStub).to.have.been.calledWith(cookie.getGarId());
      expect(garApiGetPeopleStub).to.have.been.calledWith(cookie.getGarId());
      expect(garApiGetSupportingDocsStub).to.have.been.calledWith(cookie.getGarId());
      expect(res.render).to.have.been.calledWith('app/garfile/home/index', { cookie, errors: [{ message: 'There was error retrieving the GAR. Try again later' }] });
    });
  });

  it('should inform user when GAR is submitted already', () => {
    garApiGetStub.resolves(JSON.stringify({
      status: {
        name: 'SUBMITTED',
      },
    }));
    garApiGetPeopleStub.resolves(JSON.stringify({
      items: [],
    }));
    garApiGetSupportingDocsStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(sessionSaveStub).to.have.been.called;
      expect(req.session.submiterrormessage).to.eql([{
        message: 'This GAR has already been submitted',
        identifier: '',
      }]);
      expect(res.redirect).to.have.been.calledWith('/garfile/review');
    });
  });
});
