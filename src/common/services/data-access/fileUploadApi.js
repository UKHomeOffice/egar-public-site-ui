const logger = require('../../utils/logger')(__filename);

class FileUploadApi {
  constructor(client) {
    this.client = client;
  }

  async postFile(garId, file) {
    logger.debug('SupportingDocuments upload API');
    const formData = new FormData();
    formData.append('file', new Blob([file.buffer]), file.originalname);

    return this.client.post(`/gar/${garId}`, formData);
  }
}

module.exports = { FileUploadApi };
