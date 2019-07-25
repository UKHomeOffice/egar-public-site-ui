/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const { expect } = require('chai');
const sinon = require('sinon');

require('../../global.test');

const { ExcelParser } = require('../../../common/utils/excelParser');

describe('ExcelParser', () => {
  const workbook = { A1: { v: '123' } };
  const rangeWorkbook = {
    A1: { v: 'A123' },
    B1: { v: 'B123' },
    A2: { v: 'A456' },
    B2: { v: 'B456' },
    A3: { v: 'A789' },
    B3: { v: 'B789' },
    A4: { v: 'STOP' },
  };

  it('Should successfully parse a worksheet', () => {
    const parser = new ExcelParser(workbook, { cell1: { location: 'A1' } });
    expect(parser.parse()).to.have.keys(['cell1']);
    expect(parser.parse().cell1).to.equal('123');
  });

  it('Should successfully parse a worksheet and apply transformations', () => {
    const transformer = sinon.stub().resolves(123);
    const parser = new ExcelParser(workbook, { cell1: { location: 'A1', transform: [transformer] } });
    expect(parser.parse()).to.have.keys(['cell1']);
    sinon.assert.calledOnce(transformer);
  });

  it('Should successfully parse a worksheet and apply multiple transformations', () => {
    const transformer = sinon.stub().resolves(123);
    const transformer2 = sinon.stub().resolves(234);
    const parser = new ExcelParser(workbook, { cell1: { location: 'A1', transform: [transformer, transformer2] } });
    expect(parser.parse()).to.have.keys(['cell1']);
    sinon.assert.calledOnce(transformer);
    sinon.assert.calledOnce(transformer2);
  });

  it('Should not parse a non configured range of cells', () => {
    const parser = new ExcelParser(rangeWorkbook, { cell1: { location: 'A' } }, { startRow: 1, terminator: 'STOP' });
    expect(typeof parser.rangeParse()).to.have.property('length');
    expect(parser.rangeParse()).to.have.length(3);
    expect(Object.keys(parser.rangeParse()[0])).to.have.length(1);
  });

  it('Should parse a configured cell-range', () => {
    const mapConfig = { cell1: { location: 'A' }, cell2: { location: 'B' } };
    const parser = new ExcelParser(rangeWorkbook, mapConfig, { startRow: 1, terminator: 'STOP' });
    expect(parser.rangeParse()).to.have.length(3);
    expect(parser.rangeParse()[0]).to.have.keys(['cell1', 'cell2']);
  });

  it('Should parse a configured cell-range by searching for start cell', () => {
    const mapConfig = { cell1: { location: 'A' }, cell2: { location: 'B' } };
    const parser = new ExcelParser(rangeWorkbook, mapConfig, {
      startIdentifier: 'A456', startColumn: 'A', skipNum: 1, terminator: 'STOP',
    });
    expect(parser.rangeParse()).to.have.length(1);
  });

  it('Should identify whether a row is empty or not', () => {
    expect(ExcelParser.isRowEmpty({ A1: undefined, B1: undefined })).to.be.true;
    expect(ExcelParser.isRowEmpty({ A1: 'A1', B1: undefined })).to.be.false;
  });
});
