/* eslint no-underscore-dangle: 0 */
const logger = require('../../common/utils/logger')(__filename);
const validations = require('../../app/people/validations');
const validator = require('../../common/utils/validator');

class Manifest {
  /**
   * Constructor for Manifest class
   * @param {String} apiResponse JSON object from API response
   */
  constructor(apiResponse) {
    this._apiResponse = apiResponse;
    this._constructManifest();
    this.invalidPeople = [];
    this.validationArr = [];
  }

  _constructManifest() {
    try {
      this.manifest = JSON.parse(this._apiResponse).items;
    } catch (err) {
      logger.error('Failed to parse GAR manifest');
      logger.error(err);
      throw err;
    }
  }

  /**
   * Validate Manifest data cannot be empty and cannot have invalid dates
   * @returns {Bool} true if valid, else false
   */
  async validate() {
    const validatingPeople = new Promise((resolve) => {
      resolve(
        this.manifest.forEach(async (person) => {
          try {
            const req = Object.create({ body: person });
            await validator.validateChains(validations.validations(req))
          } catch (e) {
            this._recordValidationErr(this.manifest.indexOf(person));
          }
        })
      );
    });

    await validatingPeople;

    return this.invalidPeople.length === 0;
  }

  validateCaptainCrew() {
    let captainCrewCount = 0;
    this.manifest.forEach((person) => {
      Object.keys(person).forEach((key) => {
        if (key.toLowerCase().includes('peopletype') && (person[key].name === 'Captain' || person[key].name === 'Crew')) {
          captainCrewCount += 1;
        }
      });
    });
    if (captainCrewCount >= 1) {
      return true;
    }
    return false;
  }

  /**
   * Generate an array of error objects to be used by govuk error component
   * @returns {Array} An array of {message: '', 'identifier': ''} objects
   */
  genErrValidations() {
    logger.debug('Generating manifest err validation');
    logger.debug(`Invalid people: ${this.invalidPeople}`);
    this.invalidPeople.forEach((person) => {
      this.validationArr.push({
        message: 'Click the edit link of the person(s) with the errors to edit and correct their details.',
        identifier: person,
      });
    });
    return this.validationArr;
  }

  _recordValidationErr(num) {
    if (!this.invalidPeople.includes(`person-${num}`)) {
      this.invalidPeople.push(`person-${num}`);
    }
  }

  static _constructDateObj(date) {
    //logger.info(`date pased in ${date}`)
    if (date === null) return date;
    const dateArr = date.split('-');
    return { y: dateArr[0], m: dateArr[1], d: dateArr[2] };
  }
}

module.exports.Manifest = Manifest;
