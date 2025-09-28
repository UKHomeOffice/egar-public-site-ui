/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../../global.test.js';
import CookieModel from '../../../../common/models/Cookie.class.js';
import persontype from '../../../../common/seeddata/egar_type_of_saved_person';
import documenttype from '../../../../common/seeddata/egar_saved_people_travel_document_type.json' with { type: "json"};
import genderchoice from '../../../../common/seeddata/egar_gender_choice.json' with { type: "json"};
import personApi from '../../../../common/services/personApi.js';
import controller from '../../../../app/garfile/manifest/addnewperson/get.controller.js';

describe('GAR Manifest Add Person Get Controller', () => {
  let req; let res; let personApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: { dbId: 'ABCDEFGH' },
      },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    personApiStub = sinon.stub(personApi, 'getPeople');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page if addPersonId not set', async () => {
    const cookie = new CookieModel(req);

    await controller(req, res);

    expect(personApiStub).to.not.have.been.called;
    expect(res.redirect).to.not.have.been.called;
    expect(res.render).to.have.been.calledWith('app/garfile/manifest/addnewperson/index', {
      cookie, genderchoice, persontype, documenttype, req, person: {},
    });
  });

  it('should redirect if api rejects', () => {
    req.session.addPersonId = 'PERSON-1';
    personApiStub.rejects('personApi.getPeople Example Reject');
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApiStub).to.have.been.calledOnceWithExactly('ABCDEFGH', 'individual');
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
      expect(res.render).to.not.have.been.called;
    });
  });

  it('should render page if ok', () => {
    const cookie = new CookieModel(req);
    req.session.addPersonId = 'PERSON-1';

    personApiStub.resolves(JSON.stringify([
      {
        personId: 'PERSON-1', firstName: 'Christopher', lastName: 'Pike', peopleType: { name: 'Captain' },
      },
      {
        personId: 'PERSON-2', firstName: 'James', lastName: 'Kirk', peopleType: { name: 'Captain' },
      },
    ]));
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApiStub).to.have.been.calledOnceWithExactly('ABCDEFGH', 'individual');
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.not.have.been.calledOnceWithExactly('', {
        cookie,
        persontype,
        documenttype,
        genderchoice,
        req,
        person: {
          personId: 'PERSON-1', firstName: 'Christopher', lastName: 'Pike', peopleType: 'Captain',
        },
      });
    });
  });
  // TODO: No unhappy path handling
});
