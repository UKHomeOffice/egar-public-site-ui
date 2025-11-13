const fileType = require('file-type');
const fs = require('fs');
const stream = require('stream');

const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');
const transformers = require('../../../common/utils/transformers');
const clamAVService = require('../../../common/services/clamAVService');
const uploadFile = require('../../../common/services/fileUploadApi');
const config = require('../../../common/config/index');
const { isValidFileMime } = require('../../../common/utils/validator');

const exceedFileNumSizeLimit = (fileSize, garId) => {
  logger.debug(`Entering exceed file number & size limit function, max size 8MB max number:${config.MAX_NUM_FILES}`);
  return new Promise((resolve, reject) => {
    // Get supporting docs and add file size
    //check max number of files not more than 10.
    // Check if fileSize + total >= MAX_SIZE
    const MAX_SIZE = 1024 ** 2 * 8;
    const MAX_NUM = config.MAX_NUM_FILES;
    garApi
      .getSupportingDocs(garId)
      .then((gars) => {
        let total = 0;
        const parsedGars = JSON.parse(gars);
        if (parsedGars.items.length >= MAX_NUM) {
          logger.info(`Number of supporting docs exceeds the limit: ${MAX_NUM}, gar:${garId}`);
          resolve('EXCEEDS_MAX_NUMBER');
        }
        // Get total size from gars.items.size
        parsedGars.items.forEach((gar) => {
          total += transformers.strToBytes(gar.size);
        });
        logger.info(`Total size of supporting documents for gar:${garId}`);
        if (fileSize + total > MAX_SIZE) {
          logger.info(`Total size of supporting documents exceeds max size GAR: ${fileSize + total} bytes`);
          resolve('EXCEEDS_MAX_SIZE');
        }
        resolve('SUCCESS');
      })
      .catch((err) => {
        logger.error('Unknown error whilst determining GAR supporting documents file sizes');
        logger.error(err);
        reject(err);
      });
  });
};

const handleDeleteDocument = (req, res) => {
  if (!req.body.deleteDocId) {
    return false;
  }
  logger.info('Found delete supporting document request');
  garApi
    .deleteGarSupportingDoc(req.body.garid, req.body.deleteDocId)
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (parsedResponse.message) {
        res.redirect('/garfile/supportingdocuments?query=deletefailed');
        return;
      }
      // Redirect to supporting docs
      res.redirect('/garfile/supportingdocuments');
    })
    .catch((deleteSupportingDocErr) => {
      logger.error('Failed to delete supporting document');
      logger.error(deleteSupportingDocErr);
      res.redirect('/garfile/supportingdocuments?query=deletefailed');
    });
  return true;
};

module.exports = (req, res) => {
  logger.info('Entering upload file post controller');

  if (handleDeleteDocument(req, res)) {
    return;
  }

  if (!req.file) {
    logger.debug('No file selected for upload');
    res.redirect('/garfile/supportingdocuments?query=0');
    return;
  }

  logger.debug('About to check file size');
  exceedFileNumSizeLimit(req.file.size, req.body.garid)
    .then((result) => {
      if (result === 'EXCEEDS_MAX_SIZE') {
        logger.debug('Total file size was greater than the limit');
        res.redirect('/garfile/supportingdocuments?query=limit');
        return;
      } else if (result === 'EXCEEDS_MAX_NUMBER') {
        logger.debug('Total number of files greater than the limit');
        res.redirect('/garfile/supportingdocuments?query=number');
        return;
      }
      logger.debug(`In Upload File Service. Uploaded File: ${req.file.originalname}`);
     // const mimeType = fileType(req.file.buffer);
  exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      logger.info('No file uploaded');
      return res.redirect('/garfile/supportingdocuments?query=nofile');
    }

    logger.debug(`In Upload File Service. Uploaded File: ${req.file.originalname}`);
    logger.debug(`Skipping ClamAV scan temporarily for testing`);
    return res.redirect('/garfile/supportingdocuments?query=success');

    let mimeType;

    if (req.file.path && fs.existsSync(req.file.path)) {
      const buffer = fs.readFileSync(req.file.path);
      const detected = await fileType.fromBuffer(buffer);
      logger.debug('After fileType detection');
      mimeType = detected ? detected.mime : req.file.mimetype;
    } else {
      mimeType = req.file.mimetype;
    }

    logger.info(`Detected uploaded file mimetype as: ${mimeType}`);

    if (!mimeType || !isValidFileMime(req.file.originalname, mimeType)) {
      logger.info('Rejecting file due to disallowed mimetype');
      return res.redirect('/garfile/supportingdocuments?query=invalid');
    }

    logger.info('Valid mimetype, proceeding');

    const formData = {
      name: req.file.originalname,
      file: {
        value: req.file.buffer,
        options: {
          filename: req.file.originalname,
        },
      },
    };

    // --- Inner Promise chain ---
    // await clamAVService
    //   .scanFile(formData)
    //   .then((clamavResp) => {
    //     if (clamavResp) {
    //       uploadFile
    //         .postFile(req.body.garid, req.file)
    //         .then((response) => {
    //           const parsedResponse = JSON.parse(response);
    //           if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
    //             logger.debug('Api returned message key');
    //             logger.debug(JSON.stringify(parsedResponse));
    //             req.session.errMsg = parsedResponse;
    //             return res.redirect('/garfile/supportingdocuments?query=e');
    //           }
    //           logger.debug('File uploaded');
    //           return res.redirect('/garfile/supportingdocuments');
    //         })
    //         .catch((err) => {
    //           logger.error('Failed to upload File.');
    //           logger.error(err);
    //           return res.redirect('/garfile/supportingdocuments');
    //         });
    //     } else {
    //       return res.redirect('/garfile/supportingdocuments?query=v');
    //     }
    //   })
    //   .catch((err) => {
    //     logger.error('Error occurred attempting to scan the file');
    //     logger.error(err);
    //     return res.redirect('/garfile/supportingdocuments?query=e');
    //   });
  
  } catch (error) {
    logger.error('Unexpected error during file upload process');
    logger.error(error);
    return res.redirect('/garfile/supportingdocuments?query=e');
  }
    }})};