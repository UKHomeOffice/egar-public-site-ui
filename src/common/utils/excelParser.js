/* eslint no-underscore-dangle: 0 */
/* eslint no-loop-func: 0 */

class ExcelParser {
  /**
   * Parse xls/x files using a given config
   * @param {Object} workbook XLSX Sheet object
   * @param {Object} cellMap Config in the form { property: { location: cell, transform: function } }
   * @param {Object} rangeConfig Config for parsing a more than 1 row { startRow: rowNum, terminator: terminateValue }
   */
  constructor(workbook, cellMap, rangeConfig) {
    this._workbook = workbook;
    this.cellMap = cellMap;
    this.rangeConfig = rangeConfig;
  }

  /**
   * Parse workbook using this.cellMap
   */
  parse() {
    const parsedMap = {};
    Object.keys(this.cellMap).forEach((key) => {
      let cellValue = this._getValue(this.cellMap[key].location, this.cellMap[key].raw);
      if (this.cellMap[key].transform) {
        cellValue = this.cellMap[key].transform(cellValue);
      }
      parsedMap[key] = cellValue;
    });
    return parsedMap;
  }

  /**
   * Parse a range of rows using this.cellMap & this.rangeConfig
   * @returns {Array} Array of Objects representing sheet rows
   */
  rangeParse() {
    const rowArr = [];
    let rowNum = this.rangeConfig.startRow;
    let flag = true;
    while (flag) {
      const rowObj = {};
      Object.keys(this.cellMap).forEach((key) => {
        let cellValue = flag ? this._getValue(`${this.cellMap[key]['location']}${rowNum}`) : null;
        if (cellValue === this.rangeConfig.terminator) {
          flag = false;
        }
        if (this.cellMap[key].transform && flag) {
          cellValue = this.cellMap[key].transform(cellValue);
        }
        if (cellValue !== undefined) {
          rowObj[key] = cellValue;
        }
      });
      if (flag && !ExcelParser.isRowEmpty(rowObj)) {
        rowArr.push(rowObj);
      }
      rowNum += 1;
    }
    return rowArr;
  }

  /**
   * Check to see if a given row is empty
   * @param {Object} rowObj Object representing sheet row
   * @returns {Bool} true if row is empty, else false
   */
  static isRowEmpty(rowObj) {
    return Object.keys(rowObj).every((key => rowObj[key] === undefined));
  }

  _getValue(cell, rawValue) {
    const cellValue = this._workbook[cell];
    if (rawValue) {
      return cellValue ? cellValue.w : undefined;
    }
    return cellValue ? cellValue.v : undefined;
  }
}

module.exports.ExcelParser = ExcelParser;
