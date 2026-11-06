const logger = require('../utils/logger')(__filename);
const config = require('../config/index');
const { HttpClient } = require('./httpClient');

class ClamAVService {
  constructor(client) {
    this.client = client;
  }

  /**
   * Send a file to the ClamAV REST service.
   * @param {Object} file Uploaded file with originalname and buffer fields.
   * @returns {Promise<boolean|undefined>} True for clean files, false for infected files.
   */
  async scanFile(file) {
    const formData = new FormData();
    formData.append('name', file.originalname);
    formData.append('file', new Blob([file.buffer]), file.originalname);

    try {
      let response;
      try {
        response = await this.client.post('/scan', formData);
      } catch (err) {
        if (err?.type !== 'http_error') {
          logger.error('Failed to scan file for virus');
          logger.debug(err);
          throw err;
        }
        response = err.body;
      }

      const body = typeof response === 'string' ? response : JSON.stringify(response);
      logger.debug(`ClamAV response: ${JSON.stringify(response)}`);
      logger.debug(`body: ${body}`);

      if (body.includes('ok : true')) {
        logger.debug('No virus found');
        return true;
      }
      if (body.includes('ok : false')) {
        logger.warn('Virus found; rejecting file');
        return false;
      }
      logger.warn('Unexpected ClamAV response');
      throw new Error(`Unexpected ClamAV response: ${body}`);
    } catch (err) {
      logger.warn('Virus scan request failed', { errorMessage: err?.message });
      return undefined;
    }
  }
}

let clamAVService;

function getClamAVService() {
  if (!clamAVService) {
    clamAVService = new ClamAVService(new HttpClient({ baseUrl: `${config.CLAMAV_BASE}:${config.CLAMAV_PORT}` }));
  }
  return clamAVService;
}

module.exports = {
  ClamAVService,
  scanFile: (...args) => getClamAVService().scanFile(...args),
};
