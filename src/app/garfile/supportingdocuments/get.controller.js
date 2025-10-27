const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const config = require('../../../common/config/index');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const max_num_files = config.MAX_NUM_FILES;
  logger.debug('In garfile / supporting documents get controller');
  garApi
    .getSupportingDocs(cookie.getGarId())
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        const error = [{ message: parsedResponse.message }];
        res.render('app/garfile/supportingdocuments/index', {
          cookie,
          max_num_files,
          errors: error,
        });
        return;
      }
      // No error, check the query.query parameter
      const supportingDoc = JSON.parse(apiResponse);

      // Bare minimum to send with the render call
      const context = { cookie, supportingDoc, max_num_files };
      let error = null;
      switch (req.query.query) {
        case 'e': // Error returned
          error = [req.session.errMsg];
          delete req.session.errMsg;
          break;
        case 'v': // Virus detected
          error = [
            { message: 'File cannot be uploaded. The file has a virus' },
          ];
          break;
        case '0': // No file
          error = [
            { identifier: 'file', message: 'No file selected for upload' },
          ];
          break;
        case 'limit':
          error = [{ message: 'File size exceeds total limit' }];
          break;
        case 'number':
          error = [{ message: 'Total number of files exceeds the limit' }];
          break;
        case 'deletefailed':
          error = [{ message: 'Failed to delete document. Try again' }];
          break;
        case 'invalid':
          error = [{ message: 'Invalid file type selected' }];
          break;
        default:
        // No need to set an error
      }
      if (error !== null) {
        // Add to the errors to be passed to the render call
        context.errors = error;
      }
      res.render('app/garfile/supportingdocuments/index', context);
    })
    .catch((err) => {
      logger.error('Failed to get GAR supportingdocuments details');
      logger.error(err);
      res.render('app/garfile/supportingdocuments/index', {
        cookie,
        max_num_files,
        errors: [
          {
            message:
              'There was a problem getting GAR supporting documents information',
          },
        ],
      });
    });
};
