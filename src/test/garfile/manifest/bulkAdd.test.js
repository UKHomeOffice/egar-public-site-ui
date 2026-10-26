const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const { personApi } = require('../../../common/services/dataAccessApi');

const { getDetailsByIds } = require('../../../app/garfile/manifest/bulkAdd');

describe('bulkAdd class', () => {
  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return nothing if required ids do not match', async () => {
    sinon.stub(personApi, 'getPeople').resolves([{ personId: 'PERSON-3' }]);

    await getDetailsByIds(['PERSON-1', 'PERSON-2'], 'USER-ID-1').then((result) => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-ID-1', 'individual');
      expect(result).to.eql([]);
    });
  });

  it('should return one person if required ids match', async () => {
    sinon.stub(personApi, 'getPeople').resolves([
      { personId: 'PERSON-3', peopleType: { name: 'Passenger' } },
      { personId: 'PERSON-1', peopleType: { name: 'Captain' } },
    ]);

    await getDetailsByIds(['PERSON-1', 'PERSON-2'], 'USER-ID-1').then((result) => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-ID-1', 'individual');
      expect(result).to.eql([{ personId: 'PERSON-1', peopleType: 'Captain' }]);
    });
  });

  it('should return matches', async () => {
    sinon.stub(personApi, 'getPeople').resolves([
      { personId: 'PERSON-3', peopleType: { name: 'Passenger' } },
      { personId: 'PERSON-1', peopleType: { name: 'Captain' } },
      { personId: 'PERSON-2', peopleType: { name: 'Crew' } },
    ]);

    await getDetailsByIds(['PERSON-1', 'PERSON-2'], 'USER-ID-1').then((result) => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-ID-1', 'individual');
      expect(result).to.eql([
        { personId: 'PERSON-1', peopleType: 'Captain' },
        { personId: 'PERSON-2', peopleType: 'Crew' },
      ]);
    });
  });

  it('should reject if person api rejects', async () => {
    sinon.stub(personApi, 'getPeople').rejects('personApi.getPeople Example Reject');

    await getDetailsByIds(['PERSON-1', 'PERSON-2'], 'USER-ID-1')
      .then()
      .catch((err) => {
        expect(personApi.getPeople).to.have.been.calledWith('USER-ID-1', 'individual');
        expect(err.name).to.eq('personApi.getPeople Example Reject');
      });
  });

  it('normalizes selected people without mutating the object response', async () => {
    const savedPeople = [
      { personId: 'PERSON-1', peopleType: { name: 'Captain' } },
      { personId: 'PERSON-2', peopleType: { name: 'Crew' } },
    ];
    sinon.stub(personApi, 'getPeople').resolves(savedPeople);

    const result = await getDetailsByIds(['PERSON-1'], 'USER-ID-1');

    expect(result).to.deep.equal([{ personId: 'PERSON-1', peopleType: 'Captain' }]);
    expect(savedPeople[0].peopleType).to.deep.equal({ name: 'Captain' });
    expect(savedPeople[1].peopleType).to.deep.equal({ name: 'Crew' });
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`propagates a ${type} without returning selected people`, async () => {
      const failure = Object.assign(new Error('Request failed'), { type, status: 503 });
      sinon.stub(personApi, 'getPeople').rejects(failure);

      try {
        await getDetailsByIds(['PERSON-1'], 'USER-ID-1');
        expect.fail('Expected the lookup to reject');
      } catch (error) {
        expect(error).to.equal(failure);
      }
    });
  });
});
