const request = require('request');
const logger = require('../utils/logger')(__filename);
const config = require('../config/index');

module.exports = {
  /**
   * Send file to clamAv REST service
   * @param {Object} formData Object with name and file keys
   * @returns {Promise} Resolves to bool, true if not virus else false
  */
  scanFile(formData) {
    return new Promise((resolve, reject) => {
      request.post({
        headers: { 'content-type': 'multipart/form-data' },
        uri: `${config.CLAMAV_BASE}:${config.CLAMAV_PORT}/scan`,
        formData,
      }, (error, response, body) => {
        if (error) {
          logger.error('Virus scan failed');
          logger.error(error);
          return reject(error);
        }
        logger.debug(`ClamAV response: ${response}`);
        logger.debug(`body: ${body}`);

        if (body.includes('ok : true')) {
          logger.info('No virus found');
          return resolve(true);
        }
        if (body.includes('ok : false')) {
          logger.info('Virus found, rejecting file');
          return resolve(false);
        }
        logger.info('Unexpected clamav response');
        return reject(new Error(`Unexpected clamav response: ${body}`));
      });
    });
  },
};
