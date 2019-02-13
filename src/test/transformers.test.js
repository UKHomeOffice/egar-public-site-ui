/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');

const chai = require('chai');

const should = chai.should();
const transformer = require('../common/utils/transformers');

describe('Transformers', () => {
  it('Should flatten nested peopletypes', () => {
    const person = {
      documentExpiryDate: '2030-11-11',
      documentNumber: '123131',
      documentType: 'Identity Card',
      firstName: 'Asuka',
      lastName: 'Langley',
      peopleType: {
        name: 'Captain',
      },
      personId: '55168ff5-f4f5-4538-9558-89c71ca7d9dd',
    };

    expect(transformer.transformPerson(person).peopleType).to.equal('Captain');
  });

  it('Should titlecase different document types', () => {
    expect(transformer.titleCase('identity card')).to.equal('Identity Card');
    expect(transformer.titleCase('Identity card')).to.equal('Identity Card');
    expect(transformer.titleCase('passport')).to.equal('Passport');
    expect(transformer.titleCase('iDentITy Card')).to.equal('Identity Card');
  });

  it('Should return undefined if given undefined as an input', () => {
    expect(transformer.titleCase(undefined)).to.equal(undefined);
  });

  it('Should convert a string to UpperCamelCase', () => {
    expect(transformer.upperCamelCase('Free circulation')).to.equal('FreeCirculation');
    expect(transformer.upperCamelCase('Short Term Visit')).to.equal('ShortTermVisit');
    expect(transformer.upperCamelCase('short term visit')).to.equal('ShortTermVisit');
    expect(transformer.upperCamelCase('based')).to.equal('Based');
  });

  it('Should convert a number to string', () => {
    expect(transformer.numToString(123)).to.equal('123');
    expect(transformer.numToString(undefined)).to.be.undefined;
  });

  it('Should convert a string filesize to an integer', () => {
    expect(transformer.strToBytes('15KB')).to.equal(15360);
    expect(transformer.strToBytes('6.2MB')).to.equal(6501171.2);
    expect(transformer.strToBytes('2.1GB')).to.equal(2254857830.4);
    expect(transformer.strToBytes('441B')).to.equal(441);
    expect(transformer.strToBytes('2.1KB')).to.equal(2150.4);
  });
});
