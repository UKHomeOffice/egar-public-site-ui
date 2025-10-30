const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const { garPeople } = require('../../../fixtures');

require('../../../global.test');
const garApi = require('../../../../common/services/garApi');

const controller = require('../../../../app/garfile/manifest/editperson/get.controller');

describe('Manifest Edit Person Get Controller', () => {
  let req;
  let res;
  let apiResponse;

  beforeEach(() => {
    chai.use(sinonChai);

    apiResponse = {
      items: garPeople(),
    };

    // Example request and response objects with appropriate spies
    req = {
      session: {
        gar: {
          id: 1,
        },
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect back if no person id set', async () => {
    await controller(req, res);

    expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
  });

  it('should render the appropriate page', async () => {
    req.session.editPersonId = 1;
    sinon.stub(garApi, 'getPeople').resolves(JSON.stringify(apiResponse));

    await controller(req, res);

    expect(res.redirect).to.have.not.been.called;
    expect(res.render).to.have.been.calledWith(
      'app/garfile/manifest/editperson/index'
    );
  });

  it('should redirect if the api has an issue', async () => {
    req.session.editPersonId = 1;
    sinon.stub(garApi, 'getPeople').rejects('Some reason here');

    // Promise chain, so controller call is wrapped into its own method
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(res.redirect).to.have.been.calledWith('/garfile/manifest');
    });
  });
});
