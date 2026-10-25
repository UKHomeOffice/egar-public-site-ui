const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const { HttpClient } = require('./httpClient');
const { serializeResponse } = require('./legacyApiResponse');

class FileUploadApi {
  constructor(client) {
    this.client = client;
  }

  async postFile(garId, file) {
    logger.debug('SupportingDocuments upload API');
    const formData = new FormData();
    formData.append('file', new Blob([file.buffer]), file.originalname);

    try {
      return serializeResponse(await this.client.post(endpoints.postFile(garId), formData));
    } catch (err) {
      if (err?.type === 'http_error') {
        return serializeResponse(err.body);
      }

      logger.error('Failed to upload supporting document', {
        garId,
        errorMessage: err?.message,
        stack: err?.stack,
      });
      return undefined;
    }
  }
}

const fileUploadApi = new FileUploadApi(new HttpClient({ baseUrl: endpoints.baseUrl() }));

module.exports = {
  FileUploadApi,
  postFile: (...args) => fileUploadApi.postFile(...args),
};
