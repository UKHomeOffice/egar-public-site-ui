/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import { expect } from 'chai';

import '../../global.test.js';
import autocomplete from '../../../common/utils/autocomplete.js';

/**
 * A true unit test should probably mock the incoming list of country codes,
 * but the list isn't going to wildly change and also is static enough to
 * rely upon for these assertions.
 */
describe('Autocomplete Utility', () => {
  it('should generate a list of countries with alpha 3 codes', () => {
    const result = autocomplete.generateNationalityList();
    expect(result).to.not.be.undefined;

    const uk = result.find(row => row.code === 'GBR');
    expect(uk.code).to.eq('GBR');
    expect(uk.label).to.eq('United Kingdom (GBR)');

    const jpn = result.find(row => row.code === 'JPN');
    expect(jpn.code).to.eq('JPN');
    expect(jpn.label).to.eq('Japan (JPN)');
  });
});
