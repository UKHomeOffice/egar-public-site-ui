const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../common/services/garApi');

const controller = require('../../../app/garfile/view/get.controller');
const { outboundGar } = require('../../fixtures');

describe('GAR view get controller', () => {
  let req;
  let res;
  let garApiGetStub;
  let garApiGetPeopleStub;
  let garApiGetSupportingDocsStub;

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
  });

  afterEach(() => {
    sinon.restore();
    clock.restore();
  });

  describe('checkGARUser', () => {
    it('should render page if Draft', () => {
      const cookie = new CookieModel(req);

      req.session.successHeader = 'Success';
      req.session.successMsg = 'Success Message';

      cookie.setGarId('GAR-ID-EXAMPLE-1');

      garApiGetStub.resolves(
        JSON.stringify({
          garId: 'GAR-ID-EXAMPLE-1-API',
          status: { name: 'Draft' },
          userId: 'USER-123',
        })
      );
      garApiGetPeopleStub.resolves(
        JSON.stringify({
          items: [
            { id: 'PERSON-1', firstName: 'Simona' },
            { id: 'PERSON-2', firstName: 'Serena' },
          ],
        })
      );
      garApiGetSupportingDocsStub.resolves(
        JSON.stringify({
          items: [{ name: 'EXAMPLE-DOC-1', size: '1MB' }],
        })
      );

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then()
        .then(() => {
          expect(garApiGetStub).to.have.been.calledOnceWithExactly(
            'GAR-ID-EXAMPLE-1'
          );
          expect(garApiGetPeopleStub).to.have.been.calledOnceWithExactly(
            'GAR-ID-EXAMPLE-1'
          );
          expect(
            garApiGetSupportingDocsStub
          ).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
          expect(res.render).to.have.been.calledOnceWithExactly(
            'app/garfile/view/index',
            {
              cookie,
              manifestFields,
              garfile: {
                garId: 'GAR-ID-EXAMPLE-1-API',
                status: { name: 'Draft' },
              },
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
            }
          );
        });
    });

    it('Should return isAbleToSubmitGar as false value is 2 weeks old than departure datetime', () => {
      const cookie = new CookieModel(req);
      cookie.setGarId('GAR-ID-EXAMPLE-1');
      const userOldSubmissionGar = outboundGar();
      userOldSubmissionGar.userId = 'USER-123';
      userOldSubmissionGar.departureDate = '2023-03-20';
      userOldSubmissionGar.departureTime = '10:55:26';

      garApiGetStub.resolves(JSON.stringify(userOldSubmissionGar));
      garApiGetPeopleStub.resolves(
        JSON.stringify({
          items: [
            { id: 'PERSON-1', firstName: 'Simona' },
            { id: 'PERSON-2', firstName: 'Serena' },
          ],
        })
      );
      garApiGetSupportingDocsStub.resolves(
        JSON.stringify({
          items: [{ name: 'EXAMPLE-DOC-1', size: '1MB' }],
        })
      );

      const callController = async () => {
        await controller(req, res);
      };

      let resultantOutboundGar = outboundGar();
      resultantOutboundGar.departureDate = '2023-03-20';
      resultantOutboundGar.departureTime = '10:55:26';

      callController()
        .then()
        .then(() => {
          expect(garApiGetStub).to.have.been.calledOnceWithExactly(
            'GAR-ID-EXAMPLE-1'
          );
          expect(garApiGetPeopleStub).to.have.been.calledOnceWithExactly(
            'GAR-ID-EXAMPLE-1'
          );
          expect(
            garApiGetSupportingDocsStub
          ).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
          expect(res.render).to.have.been.calledOnceWithExactly(
            'app/garfile/view/index',
            {
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
            }
          );
        });
    });
  });
});
