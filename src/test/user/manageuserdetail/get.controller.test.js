const sinon = require('sinon');
const controller = require('../../../app/user/manageuserdetail/get.controller');
const expect = require('chai').expect;
const chai = require('chai');
const sinonChai = require('sinon-chai');
const CookieModel = require('../../../common/models/Cookie.class');

describe('Manage User Detail Get Controller', () => {
    let req, res, stub;

    beforeEach(() => {
        chai.use(sinonChai);

        // Example request and response objects with appropriate spies
        req = {
            session: {
            }
        };
    
        res = {
            render: sinon.spy(),
        };
        // Need to figure out how to stub the CookieModel and its constructor,
        // in order to just check it is instantiated
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should render the appropriate page', async() => {
        let a = new CookieModel(req);
        await controller(req, res);

        // CookieModel instance created, can that be asserted
        expect(res.render).to.have.been.calledWith('app/user/manageuserdetail/index');
    });
});
