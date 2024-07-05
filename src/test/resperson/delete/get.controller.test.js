const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const resPersonApi = require('../../../common/services/resPersonApi');

const controller = require('../../../app/resperson/add/post.controller');


describe('Responsible Person Delete Get Controller', () => {
    let req; let res;

    beforeEach(() => {
        chai.use(sinonChai);

        req = {
            session: {
                u: { dbId: '90210' },
            },
        };
        res = {
            render: sinon.spy(),
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should render the page with error if the api rejeccts', async () => {
        const cookie = new CookieModel(req);
        sinon.stub(resPersonApi, 'deleteResponsiblePerson').rejects({ 'message': 'User not recoganised' });

        const callController = async () => {
            await controller(req, res);
        };

        callController().then().then(() => {
            expect(req.session.errMsg).to.eql({ message: 'User not recoganised' });
            expect(resPersonApi).to.have.been.calledWith('90210', 'individual');
            expect(res.redirect).to.have.been.calledWith('/resperson');
            expect(res.render).to.not.have.been.called;
        });

    });

    it('should render the page with error if the api resolved message response', async () => {
        const cookie = new CookieModel(req);
        sinon.stub(resPersonApi, 'deleteResponsiblePerson').resolves({ 'message': 'responsible person does not exist' });

        const callController = async () => {
            await controller(req, res);
        };

        callController().then().then(() => {
            expect(req.session.errMsg).to.eql({ message: 'responsible person does not exist' });
            expect(resPersonApi).to.have.been.calledWith('90210', 'individual');
            expect(res.redirect).to.have.been.calledWith('/resperson');
            expect(res.render).to.not.have.been.called;
        });

    });

    it('should render the page with success message on successful deletion of responsible person', async () => {
        const cookie = new CookieModel(req);
        sinon.stub(resPersonApi, 'deleteResponsiblePerson').resolves({});

        const callController = async () => {
            await controller(req, res);
        };

        callController().then().then(() => {
            expect(req.session.successHeader).to.eql('Success');
            expect(req.session.successMsg).to.eql('Responsible is person deleted');
            expect(resPersonApi).to.have.been.calledWith('90210', 'individual');
            expect(res.redirect).to.have.been.calledWith('/resperson');
            expect(res.render).to.not.have.been.called;
        });

    });

});