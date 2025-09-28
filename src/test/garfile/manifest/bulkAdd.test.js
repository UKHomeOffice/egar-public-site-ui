/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import personApi from '../../../common/services/personApi.js';
import bulkAdd from '../../../app/garfile/manifest/bulkAdd.js';

describe('bulkAdd class', () => {
  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do nothing if person api rejects', () => {

  });

  it('should return nothing if required ids do not match', async () => {
    sinon.stub(personApi, 'getPeople').resolves(JSON.stringify([
      { personId: 'PERSON-3' },
    ]));

    await bulkAdd.getDetailsByIds(['PERSON-1', 'PERSON-2'], 'USER-ID-1').then((result) => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-ID-1', 'individual');
      expect(result).to.eql([]);
    });
  });

  it('should return one person if required ids match', async () => {
    sinon.stub(personApi, 'getPeople').resolves(JSON.stringify([
      { personId: 'PERSON-3', peopleType: { name: 'Passenger' } },
      { personId: 'PERSON-1', peopleType: { name: 'Captain' } },
    ]));

    await bulkAdd.getDetailsByIds(['PERSON-1', 'PERSON-2'], 'USER-ID-1').then((result) => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-ID-1', 'individual');
      expect(result).to.eql([
        { personId: 'PERSON-1', peopleType: 'Captain' },
      ]);
    });
  });

  it('should return matches', async () => {
    sinon.stub(personApi, 'getPeople').resolves(JSON.stringify([
      { personId: 'PERSON-3', peopleType: { name: 'Passenger' } },
      { personId: 'PERSON-1', peopleType: { name: 'Captain' } },
      { personId: 'PERSON-2', peopleType: { name: 'Crew' } },
    ]));

    await bulkAdd.getDetailsByIds(['PERSON-1', 'PERSON-2'], 'USER-ID-1').then((result) => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-ID-1', 'individual');
      expect(result).to.eql([
        { personId: 'PERSON-1', peopleType: 'Captain' },
        { personId: 'PERSON-2', peopleType: 'Crew' },
      ]);
    });
  });

  it('should reject if person api rejects', async () => {
    sinon.stub(personApi, 'getPeople').rejects('personApi.getPeople Example Reject');

    await bulkAdd.getDetailsByIds(['PERSON-1', 'PERSON-2'], 'USER-ID-1').then().catch((err) => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-ID-1', 'individual');
      expect(err.name).to.eq('personApi.getPeople Example Reject');
    });
  });
});
