/* eslint no-underscore-dangle: 0 */
/* eslint no-loop-func: 0 */

class ExcelParser {
  /**
   * Parse xls/x files using a given config
   * @param workbook XLSX Sheet object
   * @param cellMap Config in the form { property: { location: cell, transform: function } }
   * @param rangeConfig Config for parsing range { startRow: rowNum, terminator: terminateValue }
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
      let cellValue = this._getValue(
        this.cellMap[key].location,
        this.cellMap[key].raw
      );
      if (this.cellMap[key].transform) {
        this.cellMap[key].transform.every(
          (transformFunc) => (cellValue = transformFunc(cellValue))
        );
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
    let rowNum =
      this.rangeConfig.startRow ||
      this.getRangeStartRow(
        this.rangeConfig.startIdentifier,
        this.rangeConfig.startColumn
      );
    let rowCount = 0;
    let flag = true;
    while (flag) {
      const rowObj = {};
      Object.keys(this.cellMap).forEach((key) => {
        let cellValue = flag
          ? this._getValue(`${this.cellMap[key].location}${rowNum}`)
          : null;
        if (
          cellValue === this.rangeConfig.terminator ||
          rowCount === this.rangeConfig.maxRows
        ) {
          flag = false;
        }
        if (this.cellMap[key].transform && flag) {
          this.cellMap[key].transform.every(
            (transformFunc) => (cellValue = transformFunc(cellValue))
          );
        }
        if (cellValue !== undefined) {
          rowObj[key] = cellValue;
        }
      });
      if (flag && !ExcelParser.isRowEmpty(rowObj)) {
        rowArr.push(rowObj);
      }
      rowNum += 1;
      rowCount += 1;
    }
    return rowArr;
  }

  /** d
   * Check to see if a given row is empty
   * @param {Object} rowObj Object representing sheet row
   * @returns {Bool} true if row is empty, else false
   */
  static isRowEmpty(rowObj) {
    return Object.keys(rowObj).every((key) => rowObj[key] === undefined);
  }

  /**
   * Using an identifier cell and a column, find the row number which proceeds this cell
   * @param {String} identifier A string to identify the cell being searched for
   * @param {String} column The column to search for the string in
   * @returns {Integer} The row number proceeding the row containing the identifying cell
   */
  getRangeStartRow(identifier, column) {
    for (let i = 1; i < 500; i += 1) {
      const cellValue = this._getValue(`${column}${i}`);
      if (cellValue === identifier) return i + this.rangeConfig.skipNum;
    }
    throw new Error(`Identifying cell not found ${identifier}`);
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
