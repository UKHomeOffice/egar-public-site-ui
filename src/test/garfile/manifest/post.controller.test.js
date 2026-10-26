const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;
const { garPeople, invalidPassengersAndCrew } = require('../../fixtures');

require('../../global.test');
const { garApi, personApi } = require('../../../common/services/dataAccessApi');
const manifestUtil = require('../../../app/garfile/manifest/bulkAdd');
const controller = require('../../../app/garfile/manifest/post.controller');

describe('Manifest Post Controller', () => {
  let req;
  let res;
  let patch;
  let getPeople;
  let getSavedPeople;
  let getManifestPeople;

  beforeEach(() => {
    req = {
      body: {},
      session: {
        gar: { id: 'stale-session-id', status: 'Draft' },
        u: { dbId: 'USER-12345' },
        save: sinon.stub().callsArg(0),
      },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      locals: { gar: { garId: '9001' } },
    };
    patch = sinon.stub(garApi, 'patch').resolves({});
    getPeople = sinon.stub(garApi, 'getPeople').resolves({ items: garPeople() });
    getSavedPeople = sinon.stub(manifestUtil, 'getDetailsByIds');
    getManifestPeople = sinon.stub(manifestUtil, 'getgarPeopleIds');
  });

  afterEach(() => sinon.restore());

  function expectManifestError(message) {
    expect(req.session.manifestErr).to.deep.equal([{ message, identifier: '' }]);
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  }

  it('redirects without API calls when no action is selected', async () => {
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expect(getPeople).not.to.have.been.called;
    expect(getSavedPeople).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('saves the selected manifest person before opening edit', async () => {
    req.body.editPersonId = '123456';
    await controller(req, res);
    expect(req.session.editPersonId).to.equal('123456');
    expect(req.session.save).to.have.been.calledOnce;
    expect(req.session.save).to.have.been.calledBefore(res.redirect);
    expect(patch).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest/editperson');
  });

  it('saves the selected saved person before opening edit', async () => {
    req.body.editSavedPerson = 'saved-person-1';
    await controller(req, res);
    expect(req.session.editPersonId).to.equal('saved-person-1');
    expect(req.session.save).to.have.been.calledOnce;
    expect(patch).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/people/edit');
  });

  it('reports a saved-person lookup failure without patching the GAR', async () => {
    req.body = { buttonClicked: 'Add to GAR', personId: 'ABCDEFG' };
    getSavedPeople.rejects(new Error('People unavailable'));
    await controller(req, res);
    expect(getSavedPeople).to.have.been.calledOnceWithExactly('ABCDEFG', 'USER-12345');
    expect(patch).not.to.have.been.called;
    expectManifestError('Failed to patch GAR with updated manifest');
  });

  it('reports a GAR patch failure when adding saved people', async () => {
    req.body = { buttonClicked: 'Add to GAR', personId: 'ABCDEFG' };
    getSavedPeople.resolves([{ firstName: 'Random', lastName: 'Person' }]);
    patch.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'GAR not found' },
      })
    );
    await controller(req, res);
    expect(patch).to.have.been.calledOnce;
    expectManifestError('Failed to patch GAR with updated manifest');
  });

  it('adds the selected saved people to the ownership-verified GAR', async () => {
    req.body = { buttonClicked: 'Add to GAR', personId: ['PERSON-1', 'PERSON-2'] };
    const people = [{ firstName: 'Random', lastName: 'Person' }];
    getSavedPeople.resolves(people);
    await controller(req, res);
    expect(getSavedPeople).to.have.been.calledOnceWithExactly(['PERSON-1', 'PERSON-2'], 'USER-12345');
    expect(patch).to.have.been.calledOnceWithExactly('9001', 'Draft', { people });
    expect(req.session.manifestErr).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('does not add selected people when saving and exiting', async () => {
    req.body = { buttonClicked: 'Save and Exit', personId: ['PERSON-1'] };
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expect(getPeople).not.to.have.been.called;
    expect(getSavedPeople).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('copies a selected manifest person to saved people without GAR-only fields', async () => {
    req.body = { buttonClicked: 'Add to PEOPLE', garPeopleId: 'PERSON-1' };
    const person = {
      firstName: 'Random',
      lastName: 'Person',
      dateOfBirth: '1980-01-01',
      documentNumber: '123456789',
      documentExpiryDate: '2150-01-01',
      documentType: 'Passport',
      documentDesc: undefined,
      nationality: 'GBR',
      gender: 'Male',
      issuingState: 'GBR',
      placeOfBirth: 'London',
      peopleType: 'Captain',
    };
    getManifestPeople.resolves([{ ...person, garPeopleId: 'PERSON-1', amgCheckinResponseCode: '0A' }]);
    const create = sinon.stub(personApi, 'create').resolves({});
    await controller(req, res);
    expect(getManifestPeople).to.have.been.calledOnceWithExactly(['PERSON-1'], '9001');
    expect(create).to.have.been.calledOnceWithExactly('USER-12345', { people: [person] });
    expect(req.session.successMsg).to.equal('Person successfully added to people!');
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('does not set success when copying manifest people to saved people fails', async () => {
    req.body = { buttonClicked: 'Add to PEOPLE', garPeopleId: ['PERSON-1'] };
    getManifestPeople.resolves(garPeople());
    sinon.stub(personApi, 'create').rejects(new Error('People unavailable'));
    await controller(req, res);
    expect(req.session.successMsg).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('reports a military-flight update failure without fetching the manifest or continuing', async () => {
    req.body = { buttonClicked: 'Continue', isMilitaryFlight: 'on' };
    patch.rejects(new Error('GAR unavailable'));
    await controller(req, res);
    expect(getPeople).not.to.have.been.called;
    expectManifestError('Failed to update GAR');
  });

  it('reports a manifest lookup failure rather than continuing', async () => {
    req.body.buttonClicked = 'Continue';
    getPeople.rejects(new Error('Manifest unavailable'));
    await controller(req, res);
    expect(getPeople).to.have.been.calledOnceWithExactly('9001');
    expectManifestError('Failed to get manifest');
  });

  it('identifies invalid people instead of continuing', async () => {
    req.body.buttonClicked = 'Continue';
    getPeople.resolves({ items: invalidPassengersAndCrew() });
    await controller(req, res);
    expect(req.session.manifestErr).to.deep.equal([
      {
        message: 'Click the edit link of the person(s) with the errors to edit and correct their details.',
        identifier: 'person-0',
      },
      {
        message: 'Click the edit link of the person(s) with the errors to edit and correct their details.',
        identifier: 'person-1',
      },
    ]);
    expect(req.session.manifestInvalidPeople).to.deep.equal(['person-0', 'person-1']);
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('requires captain or crew on a non-military flight', async () => {
    req.body.buttonClicked = 'Continue';
    getPeople.resolves({ items: [] });
    await controller(req, res);
    expect(req.session.manifestErr).to.deep.equal([
      {
        message:
          "There must be at least one captain or crew member on the voyage. If this is a military flight, this error can be bypassed in the manifest's military flight section.",
        identifier: 'manifestTable_row',
      },
    ]);
    expect(req.session.manifestInvalidPeople).to.deep.equal([]);
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/manifest');
  });

  it('allows a military flight to continue without captain or crew', async () => {
    req.body = { buttonClicked: 'Continue', isMilitaryFlight: 'on' };
    getPeople.resolves({ items: [] });
    await controller(req, res);
    expect(patch).to.have.been.calledOnceWithExactly('9001', 'Draft', { isMilitaryFlight: true });
    expect(req.session.gar.isMilitaryFlight).to.equal(true);
    expect(req.session.manifestErr).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/resperson');
  });

  it('continues with valid decoded manifest people without adding a selected saved person', async () => {
    req.body = { buttonClicked: 'Continue', personId: ['PERSON-1'] };
    await controller(req, res);
    expect(patch).to.have.been.calledOnceWithExactly('9001', 'Draft', { isMilitaryFlight: false });
    expect(getPeople).to.have.been.calledOnceWithExactly('9001');
    expect(patch).to.have.been.calledBefore(getPeople);
    expect(getSavedPeople).not.to.have.been.called;
    expect(req.session.manifestErr).to.be.undefined;
    expect(req.session.manifestInvalidPeople).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/resperson');
  });
});
