const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const resPersonApi = require('../../../common/services/resPersonApi');
const utils = require('../../../common/utils/utils');
const controller = require('../../../app/resperson/edit/post.controller');

describe('Responsible Person Edit Post Controller', () => {

    let req; let res; let resPersonEditStub; let responsiblePerson

    beforeEach(() => {

        chai.use(sinonChai);

        req = {
            body: {
                responsibleGivenName: 'Benjamin',
                responsibleSurname: 'Sisko',
                responsibleContactNo: '07878787878',
                responsibleEmail: 'testmail@test.com',
                responsibleAddressLine1: 'Add Line 1',
                responsibleAddressLine2: 'Add Line 2',
                responsibleTown: 'London',
                responsibleCountry: 'USA',
                responsiblePostcode: 'HN77NH',
                fixedBasedOperator: 'Captain',
            },
            session: {
                u: { dbId: '90210' },
            },
        };

        res = {
            redirect: sinon.spy(),
            render: sinon.spy(),
        };

        resPersonEditStub = sinon.stub(resPersonApi, 'updateResPerson');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('edit should render with errors if responsibleSurname is empty', () => {

        req.body.responsibleSurname = '';
        const cookie = new CookieModel(req);
        responsiblePerson = utils.getResponsiblePersonFromReq(req);
        const callController = async () => {
            await controller(req, res);
        };

        callController().then().then(() => {
            expect(resPersonEditStub).to.not.have.been.called;
            expect(res.redirect).to.not.have.been.called;
            expect(res.render).to.have.been.calledWith('app/resperson/edit/index', {
                cookie,
                req,
                responsiblePerson,
                fixedBasedOperatorOptions,
                errors: [
                  new ValidationRule(validator.isNotEmpty, 'responsibleSurname', req.body.responsibleSurname, 'Enter a surname for the responsible person'),
                ],
              });
        });

    });


    it('edit should render with messages if resPerson api rejects', () => {
        req.session.editResponsiblePersonId = 'EDIT-101'
        const cookie = new CookieModel(req);
        resPersonEditStub.rejects('resPersonEditStub.update Example Reject');
        responsiblePerson = utils.getResponsiblePersonFromReq(req);

        const callController = async () => {
          await controller(req, res);
        };

        callController().then().then(() => {
          expect(resPersonEditStub).to.have.been.calledWith('90210', 'EDIT-101', responsiblePerson);
          expect(res.redirect).to.not.have.been.called;
          expect(res.render).to.have.been.calledWith('app/resperson/edit/index', {
            cookie,
            responsiblePerson,
            fixedBasedOperatorOptions,
            errors: [{ message: 'There was a problem updating responsible person. Please try again' }],
          });
        });
      });

      it('edit should redirect on res person create success', () => {
        req.session.editResponsiblePersonId = 'EDIT-101'
        responsiblePerson = utils.getResponsiblePersonFromReq(req);
        resPersonEditStub.resolves(JSON.stringify({}));

        const callController = async () => {
          await controller(req, res);
        };

        callController().then().then(() => {
          expect(resPersonEditStub).to.have.been.calledWith('90210', 'EDIT-101', responsiblePerson);
          expect(res.redirect).to.have.been.calledWith('/resperson');
          expect(res.render).to.not.have.been.called;
        });
      });


});
