const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {
  postFile(garId, file) {
    logger.debug('SupportingDocuments upload API');
    return new Promise((resolve, reject) => {
      const fileName = path.basename(filePath);
      const contentType = mime.lookup(fileName) || 'application/octet-stream'; 
      const formData = {
        file: {
          //value: file.buffer, // Upload the file in the multi-part post
          value: fs.createReadStream(filePath),
          options: {
            filename: fileName,
            contentType: mimeType,
          },
        },
      };
      console.log('Uploading file:', fileName, 'with MIME type:', mimeType);
      request.post(
        {
        //  headers: { 'content-type': 'multipart/form-data' },
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
