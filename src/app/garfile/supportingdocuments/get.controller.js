const logger = require('../../../common/utils/logger')(__filename);
const cookieModel = require('../../../common/models/Cookie.class')
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  var cookie = new cookieModel(req)
  logger.debug('In garfile / supporting documents get controller');
  garApi.getSupportingDocs(cookie.getGarId())
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (parsedResponse.hasOwnProperty('message')) {
        const error = [{ message: parsedResponse.message }];
        res.render('app/garfile/supportingdocuments/index', { cookie, errors: error });
      } else {
        const supportingDoc = JSON.parse(apiResponse);
        if (req.query.query === 'e') {
          res.render('app/garfile/supportingdocuments/index', { cookie, supportingDoc, errors: [{ identifier: 'file', message: 'File not uploaded. There was an error in scanning the file. Please try again'}]});
        } else if (req.query.query === 'v') {
          res.render('app/garfile/supportingdocuments/index', { cookie, supportingDoc, errors: [{ message: 'File cannot be uploaded. The file has a virus.'}]})
        } else if (req.query.query === '0') {
          logger.debug('no file')
          res.render('app/garfile/supportingdocuments/index', { cookie, supportingDoc, errors: [{ identifier: 'file', message: 'No File selected for upload.'}]})
        } else if (req.query.query === 'limit') {
          res.render('app/garfile/supportingdocuments/index', { cookie, supportingDoc, errors: [{ message: 'File size exceeds total limit' }] });
        } else if (req.query.query === 'deletefailed') {
          res.render('app/garfile/supportingdocuments/index', { cookie, supportingDoc, errors: [{ message: 'Failed to delete document. Try again' }] });
        } else {
          res.render('app/garfile/supportingdocuments/index', { cookie, supportingDoc})
        }
      }
    }).catch((err) => {
      logger.error('Failed to get GAR supportingdocuments details');
      logger.error(err);
      res.render('app/garfile/supportingdocuments/index', { cookie, errors: [{ errors: 'There was a problem getting GAR supportingdocuments information' }] });
    });
};
