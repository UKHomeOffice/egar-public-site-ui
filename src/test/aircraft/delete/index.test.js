/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';

import '../../global.test.js';
import index from '../../../app/aircraft/delete/index.js';

describe('Aircraft index.js', () => {
  it('should have included everything', () => {
    expect(index.router).to.not.be.undefined;
    expect(index.paths).to.not.be.undefined;

    expect(Object.keys(index.paths).length).to.eq(1);
    expect(index.paths.index).to.eq('/aircraft/delete');
  });
});
