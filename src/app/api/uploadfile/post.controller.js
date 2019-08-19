const fileType = require('file-type');

const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');
const transformers = require('../../../common/utils/transformers');
const clamAVService = require('../../../common/services/clamAVService');
const uploadFile = require('../../../common/services/fileUploadApi');
const { isValidFileMime } = require('../../../common/utils/validator');

const exceedFileLimit = (fileSize, garId) => {
  logger.debug('Entering exceed file limit function');
  return new Promise((resolve, reject) => {
    // Get supporting docs and add file size
    // Check if fileSize + total >= MAX_SIZE
    const MAX_SIZE = (1024 ** 2) * 8;
    garApi.getSupportingDocs(garId).then((gars) => {
      let total = 0;
      const parsedGars = JSON.parse(gars);
      // Get total size from gars.items.size
      parsedGars.items.forEach((gar) => {
        total += transformers.strToBytes(gar.size);
      });
      logger.info(`Total size of supporting documents for GAR: ${fileSize + total} bytes`);
      resolve(((fileSize + total) > MAX_SIZE));
    }).catch((err) => {
      logger.error('Unknown error whilst determining GAR supporting documents file sizes');
      logger.error(JSON.stringify(err));
      reject(err);
    });
  });
};

module.exports = (req, res) => {
  logger.info('Entering upload file post controller');

  if (req.body.deleteDocId) {
    logger.info('Found delete supporting document request');
    garApi.deleteGarSupportingDoc(req.body.garid, req.body.deleteDocId)
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
    return;
  }

  if (!req.file) {
    logger.debug('No file selected for upload');
    res.redirect('/garfile/supportingdocuments?query=0');
    return;
  }

  logger.debug('About to check file size');
  exceedFileLimit(req.file.size, req.body.garid)
    .then((result) => {
      if (result) {
        logger.debug('Total file size was greater than the limit');
        res.redirect('/garfile/supportingdocuments?query=limit');
        return;
      }
      logger.debug(`In Upload File Service. Uploaded File: ${req.file.originalname}`);
      const mimeType = fileType(req.file.buffer);
      logger.info(`Detected uploaded file mimetype as: ${JSON.stringify(mimeType)}`);

      if (!mimeType || !isValidFileMime(req.file.originalname, mimeType.mime)) {
        logger.info('Rejecting file due to disallowed mimetype');
        res.redirect('/garfile/supportingdocuments?query=invalid');
        return;
      }
      logger.info('Valid mimetype, proceeding');
      const uriString = `${process.env.CLAMAV_BASE}:${process.env.CLAMAV_PORT}/scan`;
      logger.debug(`uri: ${uriString}`);

      const formData = {
        name: req.file.originalname,
        file: {
          value: req.file.buffer, // Upload the file in the multi-part post
          options: {
            filename: req.file.originalname,
          },
        },
      };

      clamAVService.scanFile(formData)
        .then((clamavResp) => {
          if (clamavResp) {
            uploadFile.postFile(req.body.garid, req.file)
              .then((response) => {
                const parsedResponse = JSON.parse(response);
                if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
                  // API returned error
                  logger.debug('Api returned message key');
                  logger.debug(JSON.stringify(parsedResponse));
                  res.redirect('/garfile/supportingdocuments?query=e');
                  return;
                }
                logger.debug('File uploaded');
                res.redirect('/garfile/supportingdocuments');
              })
              .catch((err) => {
                logger.error('Failed to upload File.');
                logger.error(err);
                res.redirect('/garfile/supportingdocuments');
              });
          } else {
            res.redirect('/garfile/supportingdocuments?query=v');
          }
        })
        .catch((err) => {
          logger.error('Error occurred attempting to scan the file');
          logger.error(JSON.stringify(err));
          res.redirect('/garfile/supportingdocuments?query=e');
        });
    })
    .catch(() => {
      logger.debug('Error occurred during scanning the file');
      res.redirect('/garfile/supportingdocuments?query=e');
    });
};
