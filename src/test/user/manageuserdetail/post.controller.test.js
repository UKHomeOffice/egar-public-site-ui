/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const userApi = require('../../../common/services/userManageApi');

const controller = require('../../../app/user/manageuserdetail/post.controller');

describe('Manage User Detail Post Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        firstname: 'Kylo',
        lastname: 'Ren',
      },
      session: {
        u: {
          e: 'kylo.ren@firstorder.emp',
          rl: 'Admin',
          fn: 'Kylo',
          ln: 'Ren',
        },
      },
    };
    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return validation error on empty first name', () => {
    req.body.firstname = '';

    const cookie = new CookieModel(req);
    cookie.getUserFirstName();

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledWith('app/user/manageuserdetail/index', {
        cookie,
        errors: [new ValidationRule(validator.notEmpty, 'firstname', '', 'Enter your given name')],
      });
    });

    delete req.body.firstname;

    callController().then(() => {
      expect(res.render).to.have.been.calledWith('app/user/manageuserdetail/index', {
        cookie,
        errors: [new ValidationRule(validator.notEmpty, 'firstname', undefined, 'Enter your given name')],
      });
    });
  });

  it('should return validation error on empty last name', () => {
    req.body.lastname = '';
    req.body.firstname = 'Kylo';

    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledWith('app/user/manageuserdetail/index', {
        cookie,
        errors: [new ValidationRule(validator.notEmpty, 'lastname', '', 'Enter your family name')],
      });
    });
  });

  it('should return an error if the user api rejects', () => {
    sinon.stub(userApi, 'updateDetails').rejects('userApi.updateDetails Example Reject');
    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(res.render).to.have.been.calledWith('app/user/manageuserdetail/index', {
        cookie,
        errors: [{ message: 'Failed to update. Try again' }],
      });
    });
  });

  it('should return the response if the api returns an error message', () => {
    sinon.stub(userApi, 'updateDetails').resolves(JSON.stringify({
      message: 'Person does not exist',
    }));
    const cookie = new CookieModel(req);

    cookie.setUserFirstName('Kylo');
    cookie.setUserLastName('Ren');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(userApi.updateDetails).to.have.been.calledWith('kylo.ren@firstorder.emp', 'Kylo', 'Ren');
      expect(res.render).to.have.been.calledWith('app/user/manageuserdetail/index', {
        cookie,
        errors: [{ message: 'Person does not exist' }],
      });
    });
  });

  it('should update the cookie if the api returns ok', () => {
    sinon.stub(userApi, 'updateDetails').resolves(JSON.stringify({
      firstName: 'Kylo',
      lastName: 'Ren',
    }));
    const cookie = new CookieModel(req);
    cookie.setUserFirstName('Kylo');
    cookie.setUserLastName('Ren');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(userApi.updateDetails).to.have.been.calledWith('kylo.ren@firstorder.emp', 'Kylo', 'Ren');
      expect(res.render).to.have.been.calledWith('app/user/detailschanged/index', { cookie });
    });
  });
});
