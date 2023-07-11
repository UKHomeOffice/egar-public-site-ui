const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../common/services/garApi');
//const validator = require('../../../common/utils/validator');
//const validationList = require('./validations');

module.exports = (req, res) => {
  logger.debug('In garfile / amg get controller');

  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();

  Promise.all([
    garApi.get(garId),
    garApi.getPeople(garId),
    garApi.getSupportingDocs(garId),
  ]).then((apiResponse) => {
    const garfile = JSON.parse(apiResponse[0]);
   // validator.handleResponseError(garfile);

    const garpeople = JSON.parse(apiResponse[1]);
    //validator.handleResponseError(garpeople);

    console.error(garpeople);

    const garsupportingdocs = JSON.parse(apiResponse[2]);
    //validator.handleResponseError(garsupportingdocs);

    //const validations = validationList.validations(garfile, garpeople);
    const renderObj = {
      cookie,
      manifestFields,
      garfile,
      garpeople,
      garsupportingdocs,
      showChangeLinks: true,
    };

    res.render('app/garfile/amg/index', renderObj);
  }).catch((err) => {
    logger.error('Error retrieving GAR for amg');
    logger.error(JSON.stringify(err));
    res.render('app/garfile/amg/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
  });
};
