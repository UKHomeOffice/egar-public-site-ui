const indexPath = '/upload';
const paths = {
  index: indexPath,
};

const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ storage, limits: { fileSize: (1024 ** 2) * 8 } }).single('file');
const stream = require('stream');
const uploadFile = require('../../../common/services/fileUploadApi');
const logger = require('../../../common/utils/logger');
const clamavService = require('../../../common/services/clamavservice');
const garApi = require('../../../common/services/garApi');
const transformers = require('../../../common/utils/transformers');

router.get('/upload', (req, res) => {
  res.json({ message: 'welcome to our upload module apis' });
});

function exceedFileLimit(fileSize, garId) {
  return new Promise((resolve, reject) => {
    // Get supporting docs and add file size
    // Check if fileSize + total >= MAX_SIZE
    const MAX_SIZE = (1024 ** 2) * 8;
    garApi.getSupportingDocs(garId)
      .then((gars) => {
        let total = 0;
        const parsedGars = JSON.parse(gars);
        // Get total size from gars.items.size
        parsedGars.items.forEach((gar) => {
          total += transformers.strToBytes(gar.size);
        });
        logger.info(`Total size: ${fileSize + total}`);
        return resolve(((fileSize + total) > MAX_SIZE));
      });
  });
}

router.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      logger.info('File rejected due to size at multer level');
      return res.redirect('/garfile/supportingdocuments?query=limit');
    }

    if (!req.file) {
      logger.debug('No file selected for upload');
      return res.redirect('/garfile/supportingdocuments?query=0');
    }

    exceedFileLimit(req.file.size, req.body.garid)
      .then((result) => {
        if (result) {
          return res.redirect('/garfile/supportingdocuments?query=limit');
        }
        logger.debug(`In Upload File Service. Uploaded File: ${req.file.originalname}`);
        logger.debug('Calling ClamAv service');

        const readStream = new stream.Readable();
        readStream.push(req.file.buffer);
        readStream.push(null);
        const uriString = `${process.env.CLAMAV_BASE}:${process.env.CLAMAV_PORT}/scan`;
        logger.debug(`uri: ${uriString}`);

        const formData = {
          name: req.file.originalname,
          file: {
            value: req.file.buffer, // Upload the  file in the multi-part post
            options: {
              filename: req.file.originalname,
            },
          },
        };

        clamavService.scanFile(formData)
          .then((clamavResp) => {
            if (clamavResp) {
              uploadFile.postFile(req.body.user, req.body.garid, req.file)
                .then((response) => {
                  const parsedResponse = JSON.parse(response);
                  if (parsedResponse.hasOwnProperty('message')) {
                    // API returned error
                    logger.debug('Api returned message key');
                    logger.debug(JSON.stringify(parsedResponse));
                    res.redirect('/garfile/supportingdocuments?query=e');
                  } else {
                    logger.debug('File uploaded');
                    res.redirect('/garfile/supportingdocuments');
                  }
                })
                .catch((err) => {
                  logger.error('Failed to upload File.');
                  logger.error(err);
                  res.redirect('/garfile/supportingdocuments');
                });
            } else {
              return res.redirect('/garfile/supportingdocuments?query=v');
            }
          })
          .catch(() => {
            logger.debug('Error occurred during scanning the file');
            res.redirect('/garfile/supportingdocuments?query=e');
          });
      })
      .catch(() => {
        logger.debug('Error occurred during scanning the file');
        res.redirect('/garfile/supportingdocuments?query=e');
      });
  });
});

module.exports = {
  router,
  paths,
};
