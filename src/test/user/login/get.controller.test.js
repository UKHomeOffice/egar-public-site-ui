const sinon = require('sinon');
const expect = require('chai').expect;
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/user/login/get.controller');

describe('User Login Get Controller', () => {
    let req, res;

    beforeEach(() => {
        chai.use(sinonChai);

        req = {
            session: {
            }
        };
    
        res = {
            render: sinon.spy(),
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should render the appropriate page', async() => {
        const cookie = new CookieModel(req);
        await controller(req, res);

        // CookieModel instance created, can that be asserted
        expect(res.render).to.have.been.calledWith('app/user/login/index', { cookie });
    });
});
