const sinon = require('sinon');
const controller = require('../../../app/garfile/departure/post.controller');
const garApi = require('../../../common/services/garApi');
const expect = require('chai').expect;
const chai = require('chai');
const sinonChai = require('sinon-chai');

describe('Departure Post Controller', () => {

    let req, res;

    beforeEach(() => {
        chai.use(sinonChai);

        // Example request and response objects with appropriate spies
        req = {
            body: {
                departureDate: null,
                departurePort: 'ZZZZ',
            },
            session: {
                gar: {
                    id: 12345,
                    voyageDeparture: {
                        departureDay: 6,
                        departureMonth: 6,
                        departureYear: 2019,
                    },
                },
            }
        };
    
        res = {
            render: sinon.spy(),
        };

        // Stub APIs, in this case, GAR API
        sinon.stub(garApi, 'get').callsFake((garId) => {
            console.log('Stubbed garApi get method called');
            console.log('garId: ' + garId);
            return Promise.resolve(JSON.stringify(req.session.gar));
        });

        sinon.stub(garApi, 'patch').callsFake((garId, status, partial) => {
            console.log('Stubbed garApi patch method called');
            console.log('garId: ' + garId);
            console.log('status: ' + status);
            console.log('partial: ' + partial);
            return Promise.resolve();
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should fail validation on basic submit', async() => {
        await controller(req, res);

        // sinon.assert.calledOnce(res.render('Blah'));
        expect(res.render).to.have.been.calledWith('app/garfile/departure/index');
    });
});
