const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');

const { deleteAccount } = require('../../../app/user/deleteAccount/utils');
const controller = require('../../../app/user/deleteAccount/get.controller');

describe('User Delete Account Get Controller', () => {
  let req;
  let res;
  let deleteOptionStub;
  let textStub;
  const userRole = 'User';

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: { e: 'exampleuser@somewhere.com', rl: userRole, fn: 'Example' },
      },
    };
    res = {
      render: sinon.spy(),
      locals: {},
    };

    deleteOptionStub = sinon.stub(deleteAccount, userRole);
    textStub = sinon.stub().returns({ deleteButton: 'Delete account', deleteOrgInfo: '' });

    deleteOptionStub.onFirstCall().resolves({
      text: textStub,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('renders the deletion page with text from the current role', async () => {
    await controller(req, res);

    expect(deleteOptionStub).to.have.been.calledOnce;
    expect(deleteOptionStub.firstCall.args[0]).to.be.instanceOf(CookieModel);
    expect(textStub).to.have.been.calledOnceWithExactly();
    expect(res.locals.text).to.deep.equal({ deleteButton: 'Delete account', deleteOrgInfo: '' });
    expect(res.render).to.have.been.calledOnceWithExactly('app/user/deleteAccount/index', {
      cookie: new CookieModel(req),
    });
  });

  it('renders an error when the role-specific options cannot be loaded', async () => {
    deleteOptionStub.resetBehavior();
    deleteOptionStub.rejects(new Error('Unavailable'));
    await controller(req, res);

    expect(textStub).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/user/deleteAccount/index', {
      cookie: new CookieModel(req),
      errors: [{ message: 'Internal Server Error. Please contact support or try again' }],
    });
  });

  it('renders an error when generating the deletion text throws', async () => {
    const cookie = new CookieModel(req);

    textStub.throws(new Error('Unavailable'));

    await controller(req, res);

    expect(textStub).to.have.been.calledOnce;
    expect(res.render).to.have.been.calledOnceWithExactly('app/user/deleteAccount/index', {
      cookie,
      errors: [
        {
          message: 'Internal Server Error. Please contact support or try again',
        },
      ],
    });
  });
});
