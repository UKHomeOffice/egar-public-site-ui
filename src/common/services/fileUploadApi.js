const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {
  postFile(garId, file) {
    logger.debug('SupportingDocuments upload API');
    return new Promise((resolve, reject) => {
      const formData = {
        file: {
          value: file.buffer, // Upload the file in the multi-part post
          options: {
            filename: file.originalname,
          },
        },
      };

      request.post(
        {
          headers: { 'content-type': 'multipart/form-data' },
          uri: endpoints.postFile(garId),
          formData,
        },
        (error, response, body) => {
          if (error) {
            reject(error);
            return error;
          }
          return resolve(body);
        }
      );
    }).catch((err) => {
      logger.error(err);
    });
  },
};
