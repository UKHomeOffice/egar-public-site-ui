import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import fixedBasedOperatorOptions from '../../../common/seeddata/fixed_based_operator_options.json' with { type: "json"};
import resPersonApi from '../../../common/services/resPersonApi.js';
import utils from '../../../common/utils/utils.js';
import controller from '../../../app/resperson/add/post.controller.js';

describe('Responsible Person Add Post Controller', () => {
    let req; let res; let resPersonApiStub; let responsiblePerson

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
        responsiblePerson = utils.getResponsiblePersonFromReq(req);

        res = {
            redirect: sinon.spy(),
            render: sinon.spy(),
        };

        resPersonApiStub = sinon.stub(resPersonApi, 'create');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should render with errors if responsibleSurname is empty', () => {
        req.body.responsibleSurname = '';
        const cookie = new CookieModel(req);
        _responsiblePerson = utils.getResponsiblePersonFromReq(req);
        const callController = async () => {
            await controller(req, res);
        };

        callController().then().then(() => {
            expect(resPersonApiStub).to.not.have.been.called;
            expect(res.redirect).to.not.have.been.called;
            expect(res.render).to.have.been.calledWith('app/resperson/add/index', {
                cookie,
                req,
                fixedBasedOperatorOptions,
                errors: [
                  new ValidationRule(validator.isNotEmpty, 'responsibleSurname', req.body.responsibleSurname, 'Enter a surname for the responsible person'),
                ],
                responsiblePerson: _responsiblePerson,
              });
        });

    });

    it('should render with messages if resPerson api rejects', () => {
        const cookie = new CookieModel(req);
        resPersonApiStub.rejects('resPersonApiStub.create Example Reject');

        const callController = async () => {
          await controller(req, res);
        };

        callController().then().then(() => {
          expect(resPersonApiStub).to.have.been.calledWith('90210', responsiblePerson);
          expect(res.redirect).to.not.have.been.called;
          expect(res.render).to.have.been.calledWith('app/resperson/add/index', {
            cookie,
            fixedBasedOperatorOptions,
            errors: [{ message: 'There was a problem creating the responsible person. Please try again' }],
          });
        });
      });

      it('should redirect on res person create success', () => {
        resPersonApiStub.resolves(JSON.stringify({}));

        const callController = async () => {
          await controller(req, res);
        };

        callController().then().then(() => {
          expect(resPersonApiStub).to.have.been.calledWith('90210', responsiblePerson);
          expect(res.redirect).to.have.been.calledWith('/resperson');
          expect(res.render).to.not.have.been.called;
        });
      });

});

