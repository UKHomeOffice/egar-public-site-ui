/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');

const index = require('../../../../app/garfile/manifest/editperson/index');

describe('Garfile Manifest Edit Person index.js', () => {
  it('should have included everything', () => {
    expect(index.router).to.not.be.undefined;
    expect(index.paths).to.not.be.undefined;

    expect(Object.keys(index.paths).length).to.eq(1);
    expect(index.paths.index).to.eq('/garfile/manifest/editperson');
  });
});
