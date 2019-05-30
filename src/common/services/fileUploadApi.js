const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const stream = require('stream')

var fs = require('fs');

module.exports = {
    postFile(userId, garId, file){
        logger.debug("SupportingDocuments upload API")
        return new Promise((resolve, reject) => {
            let formData = {
                file: {
                    value: file.buffer, // Upload the  file in the multi-part post
                    options: {
                       filename: file.originalname
                    }
              }
            }
            request.post({
                headers: { 'content-type': 'multipart/form-data' },
                uri: endpoints.postFile(garId),
                formData: formData
            
                }, (error, response, body) => {
                  if (error) {
                    return error;
                  }
                  resolve(body);
                  //return body;
                })
        })
        .catch((err) => {
            logger.error(err);
          });
    }
}