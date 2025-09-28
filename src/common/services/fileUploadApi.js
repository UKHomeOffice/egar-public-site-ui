import request from 'request';
import loggerFactory from '../utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import endpoints from '../config/endpoints.js';

const exported = {
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

      request.post({
        headers: { 'content-type': 'multipart/form-data' },
        uri: endpoints.postFile(garId),
        formData,
      }, (error, response, body) => {
        if (error) {
          reject(error);
          return error;
        }
        return resolve(body);
      });
    })
      .catch((err) => {
        logger.error(err);
      });
  }
};

export default exported;

export const {
  postFile
} = exported;
