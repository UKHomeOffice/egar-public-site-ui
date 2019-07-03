const sinon = require('sinon');
const expect = require('chai').expect;
const chai = require('chai');
const sinonChai = require('sinon-chai');

const logger = require('../../../common/utils/logger')(__filename);
const tokenApi = require('../../../common/services/tokenApi');
const token = require('../../../common/services/create-token');
const userApi = require('../../../common/services/userManageApi');
const emailService = require('../../../common/services/sendEmail');

const controller = require('../../../app/user/login/post.controller');

describe('User Login Post Controller', () => {
  let req, res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example request and response objects with appropriate spies
    req = {
      body: {
        departureDate: null,
        departurePort: 'ZZZZ',
      },
      session: {
        gar: {
          id: 12345,
          voyageDeparture: {
            departureDay: 6,
            departureMonth: 6,
            departureYear: 2019,
          },
        },
      }
    };

    res = {
      render: sinon.stub(),
    };

    // TODO: Stubs
    
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should fail validation on erroneous submit', async() => {
    const emptyRequest = {
      body: {
        Username: '',
      },
      session: {
        cookie: {},
      },
    }
    try {
      await controller(emptyRequest, res);
    }
    catch (err) {
      expect(err).to.eq('Validation error when logging in');
      expect(res.render).to.have.been.calledWith('app/user/login/index');
    }
  });

  // TODO: UserAPI
  // Reject
  // Resolve ('no results found') <- Sends an email, despite going to the MFA screen
  // Resolve ('no results found') with no Gov Notify, <- goes to MFA screen still
  // Resolve with verified user
  // Resolve with verified user but with issue with the tokenApi MFA token method
  // Resolve with unverified user
});
