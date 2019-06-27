const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../common/services/garApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');

const voyageDateMsg = 'Arrival date must not be earlier than departure date';

function handleResponseError(parsedApiResponse) {
  if ({}.hasOwnProperty.call(parsedApiResponse, 'message')) {
    logger.debug(`Api returned Error: ${parsedApiResponse}`);
  }
}

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / review get controller');

  const garId = cookie.getGarId();

  Promise.all([
    garApi.getPeople(garId),
    garApi.get(garId),
    garApi.getSupportingDocs(garId)])
    .then((apiResponse) => {
      const garpeople = JSON.parse(apiResponse[0]);
      handleResponseError(garpeople);

      const garfile = JSON.parse(apiResponse[1]);
      handleResponseError(garfile);

      const garsupportingdocs = JSON.parse(apiResponse[2]);
      handleResponseError(garsupportingdocs);

      const voyageDateObj = {
        departureDate: garfile.departureDate,
        arrivalDate: garfile.arrivalDate,
      };

      const validations = [[
        new ValidationRule(validator.isValidDepAndArrDate, 'voyageDates', voyageDateObj, voyageDateMsg),
      ]];

      const localvar = {
        cookie,
        showChangeLinks: true,
        manifestFields,
        garfile,
        garpeople,
        garsupportingdocs,
      };

      validator.validateChains(validations)
        .then(() => {
          if (req.session.submiterrormessage && req.session.submiterrormessage.length > 0) {
            const msg = req.session.submiterrormessage;
            delete req.session.submiterrormessage;
            localvar.errors = msg;
            res.render('app/garfile/review/index', localvar);
          } else {
            res.render('app/garfile/review/index', localvar);
          }
        }).catch((err) => {
          logger.info('Validation failed');
          logger.info(err);
          localvar.errors = err;
          res.render('app/garfile/review/index', localvar);
        });
    });
};
