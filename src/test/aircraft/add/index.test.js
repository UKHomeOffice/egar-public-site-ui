/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import { expect } from 'chai';

import '../../global.test.js';
import index from '../../../app/aircraft/add/index.js';

describe('Aircraft index.js', () => {
  it('should have included everything', () => {
    expect(index.router).to.not.be.undefined;
    expect(index.paths).to.not.be.undefined;

    // TODO: Inspect the index.router object, research into express.js Router

    expect(Object.keys(index.paths).length).to.eq(1);
    expect(index.paths.index).to.eq('/aircraft/add');
  });
});
