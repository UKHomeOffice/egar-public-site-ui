const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const utils = require('../../../common/utils/utils');
const { garApi } = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/garfile/view/get.controller');
const { outboundGar } = require('../../fixtures');

describe('GAR view get controller', () => {
  let req;
  let res;
  let garApiGetStub;
  let garApiGetPeopleStub;
  let garApiGetSupportingDocsStub;
  let getGarCheckinProgressStub;
  let getDurationBeforeDepartureStub;

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
      body: { garId: 'GAR-ID-EXAMPLE-1' },
      query: { resubmitted: 'no' },
      session: {
        successHeader: undefined,
        successMsg: undefined,
        u: {
          dbId: 'USER-123',
        },
      },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    garApiGetStub = sinon.stub(garApi, 'get');
    garApiGetPeopleStub = sinon.stub(garApi, 'getPeople');
    garApiGetSupportingDocsStub = sinon.stub(garApi, 'getSupportingDocs');
    getGarCheckinProgressStub = sinon.stub(garApi, 'getGarCheckinProgress');
    getDurationBeforeDepartureStub = sinon.stub(utils, 'getDurationBeforeDeparture');
  });

  afterEach(() => {
    sinon.restore();
    clock.restore();
  });

  it('renders an error when the initial GAR lookup fails', async () => {
    garApiGetStub.rejects(new Error('Unavailable'));

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/view/index', {
      errors: [{ message: 'Failed to get GAR information' }],
    });
  });

  it('retains the page context when the response-code lookup fails', async () => {
    const cookie = new CookieModel(req);
    garApiGetStub.resolves({ status: { name: 'Draft' } });
    garApiGetPeopleStub.onFirstCall().resolves({ items: [] });
    garApiGetPeopleStub.onSecondCall().rejects(new Error('Unavailable'));
    garApiGetSupportingDocsStub.resolves({ items: [] });
    getGarCheckinProgressStub.resolves('Complete');

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/view/index', {
      cookie,
      manifestFields,
      garfile: {},
      garpeople: {},
      garsupportingdocs: {},
      errors: [{ message: 'Failed to get GAR information' }],
    });
  });

  describe('checkGARUser', () => {
    it('should render page if Draft', async () => {
      const cookie = new CookieModel(req);

      req.session.successHeader = 'Success';
      req.session.successMsg = 'Success Message';

      cookie.setGarId('GAR-ID-EXAMPLE-1');

      garApiGetStub.resolves({
        garId: 'GAR-ID-EXAMPLE-1-API',
        status: { name: 'Draft' },
        userId: 'USER-123',
      });
      garApiGetPeopleStub.resolves({
        items: [
          { id: 'PERSON-1', firstName: 'Simona' },
          { id: 'PERSON-2', firstName: 'Serena' },
        ],
      });

      garApiGetSupportingDocsStub.resolves({
        items: [{ name: 'EXAMPLE-DOC-1', size: '1MB' }],
      });

      getGarCheckinProgressStub.resolves('Complete');

      getDurationBeforeDepartureStub.returns(125);

      await controller(req, res);

      expect(garApiGetStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetSupportingDocsStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/view/index', {
        cookie,
        manifestFields,
        garfile: { garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Draft' } },
        isAbleToCancelGar: true,
        successHeader: 'Success',
        successMsg: 'Success Message',
        garpeople: {
          items: [
            { id: 'PERSON-1', firstName: 'Simona' },
            { id: 'PERSON-2', firstName: 'Serena' },
          ],
        },
        garsupportingdocs: {
          items: [{ name: 'EXAMPLE-DOC-1', size: '1MB' }],
        },
        showChangeLinks: true,
        isJourneyUKInbound: true,
        resubmitted: 'no',
        durationInDeparture: 125,
        numberOf0TResponseCodes: 2,
        isResubmitted: false,
      });
    });

    it('disables cancellation for a departure more than two weeks ago', async () => {
      const cookie = new CookieModel(req);
      cookie.setGarId('GAR-ID-EXAMPLE-1');
      const userOldSubmissionGar = outboundGar();
      userOldSubmissionGar.userId = 'USER-123';
      userOldSubmissionGar.departureDate = '20 March 2023';
      userOldSubmissionGar.departureTime = '10:55:26';

      garApiGetStub.resolves(userOldSubmissionGar);
      garApiGetPeopleStub.resolves({
        items: [
          { id: 'PERSON-1', firstName: 'Simona' },
          { id: 'PERSON-2', firstName: 'Serena' },
        ],
      });
      garApiGetSupportingDocsStub.resolves({
        items: [{ name: 'EXAMPLE-DOC-1', size: '1MB' }],
      });

      getGarCheckinProgressStub.resolves('Complete');
      getDurationBeforeDepartureStub.returns(125);

      let resultantOutboundGar = outboundGar();
      resultantOutboundGar.departureDate = '20 March 2023';
      resultantOutboundGar.departureTime = '10:55:26';

      await controller(req, res);

      expect(garApiGetStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetSupportingDocsStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/view/index', {
        cookie,
        manifestFields,
        showChangeLinks: false,
        isJourneyUKInbound: false,
        isAbleToCancelGar: false,
        garfile: resultantOutboundGar,
        successMsg: undefined,
        successHeader: undefined,
        garpeople: {
          items: [
            { id: 'PERSON-1', firstName: 'Simona' },
            { id: 'PERSON-2', firstName: 'Serena' },
          ],
        },
        garsupportingdocs: {
          items: [{ name: 'EXAMPLE-DOC-1', size: '1MB' }],
        },
        resubmitted: 'no',
        durationInDeparture: 125,
        numberOf0TResponseCodes: 2,
        isResubmitted: false,
      });
    });
  });
});
