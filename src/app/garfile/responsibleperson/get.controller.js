const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');

module.exports = (req, res) => {
  logger.debug('In garfile/responsible person get controller');
  const cookie = new CookieModel(req);

  const garId = cookie.getGarId();

  const context = {
    fixedBasedOperatorOptions,
    cookie,
  };

  garApi.get(garId)
    .then((apiResponse) => {
      const gar = JSON.parse(apiResponse);

      const responsiblePerson = {
        responsibleGivenName: gar.responsibleGivenName,
        responsibleSurname: gar.responsibleSurname,
        responsibleAddressLine1: gar.responsibleAddressLine1,
        responsibleEmail: gar.responsibleEmail,
        responsibleAddressLine2: gar.responsibleAddressLine2,
        responsibleTown: gar.responsibleTown,
        responsiblePostcode: gar.responsiblePostcode,
        responsibleCounty: gar.responsibleCounty,
        responsibleContactNo: gar.responsibleContactNo,
      };

     
      context.gar = gar;
      cookie.setGarResponsiblePerson(responsiblePerson);

      res.render('app/garfile/responsibleperson/index', context);
    })
    .catch((err) => {
      logger.error('API failed to retrieve GAR');
      logger.error(err);
      res.render('app/garfile/responsibleperson/index', context, {
        errors: [{
          message: 'Problem retrieving GAR',
        }],
      });
    });
};
