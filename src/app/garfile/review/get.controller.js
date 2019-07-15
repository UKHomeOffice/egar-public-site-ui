const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../common/services/garApi');
const validator = require('../../../common/utils/validator');
const validationList = require('./validations');


module.exports = (req, res) => {
  logger.debug('In garfile / review get controller');
  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();

  Promise.all([
    garApi.get(garId),
    garApi.getPeople(garId),
    garApi.getSupportingDocs(garId),
  ]).then((apiResponse) => {
    const garfile = JSON.parse(apiResponse[0]);
    validator.handleResponseError(garfile);

    const garpeople = JSON.parse(apiResponse[1]);
    validator.handleResponseError(garpeople);

    const garsupportingdocs = JSON.parse(apiResponse[2]);
    validator.handleResponseError(garsupportingdocs);

    const validations = validationList.validations(garfile, garpeople);
    const renderObj = {
      cookie,
      manifestFields,
      garfile,
      garpeople,
      garsupportingdocs,
      showChangeLinks: true,
    };

    validator.validateChains(validations)
      .then(() => {
        res.render('app/garfile/review/index', renderObj);
      }).catch((err) => {
        logger.info('GAR review validation failed');
        logger.debug(JSON.stringify(err));
        renderObj.errors = err;
        res.render('app/garfile/review/index', renderObj);
      });
  }).catch((err) => {
    logger.error('Error retrieving GAR for review');
    logger.error(JSON.stringify(err));
    res.render('app/garfile/review/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
  });
};
