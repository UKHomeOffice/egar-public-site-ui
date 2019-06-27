const index = require('../../app/aircraft/index');
const expect = require('chai').expect;

describe('Aircraft index.js', () => {
    it('should have included everything', () => {
        expect(index.router).to.not.be.undefined;
        expect(index.paths).to.not.be.undefined;

        // TODO: Inspect the index.router object, research into express.js Router

        expect(Object.keys(index.paths).length).to.eq(1);
        expect(index.paths.index).to.eq('/aircraft');
    });
});