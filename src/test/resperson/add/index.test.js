const { expect } = require('chai');

require('../../global.test');
const index = require('../../../app/resperson/add/index');

describe('Responsible person index.js', () => {
  it('should have included responsible person everything', () => {
    expect(index.router).to.not.be.undefined;
    expect(index.paths).to.not.be.undefined;
    expect(Object.keys(index.paths).length).to.eq(1);
    expect(index.paths.index).to.eq('/resperson/add');
  });
});
