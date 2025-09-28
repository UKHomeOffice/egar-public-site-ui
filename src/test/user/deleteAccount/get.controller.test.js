/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import { deleteAccount } from '../../../app/user/deleteAccount/utils.js';
import controller from '../../../app/user/deleteAccount/get.controller.js';

describe('User Delete Account Get Controller', () => {
  let req; let res; let deleteOptionStub;
  let textStub;
  const userRole = 'User';

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: { e: 'exampleuser@somewhere.com', rl: 'Admin', fn: 'Example' },
      },
    };
    res = {
      render: sinon.spy(),
      locals: {},
    };

    deleteOptionStub = sinon.stub(deleteAccount, userRole);
    textStub = sinon.stub();

    deleteOptionStub.onFirstCall().resolves({
      text: textStub,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page', async () => {
    const cookie = new CookieModel(req);

    textStub.onFirstCall().rejects('Error occured');

    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/user/deleteAccount/index', {
      cookie,
      errors: [
        {
          message: 'Internal Server Error. Please contact support or try again',
        },
      ],
    });
  });
});
