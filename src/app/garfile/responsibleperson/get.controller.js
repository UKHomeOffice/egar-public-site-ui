const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  logger.debug('In garfile/responsible person get controller');
  const cookie = new CookieModel(req);

  const garId = cookie.getGarId();

  garApi.get(garId)
    .then((apiResponse) => {
      const gar = JSON.parse(apiResponse);

      const responsiblePerson = {
        responsibleGivenName: gar.responsibleGivenName,
        responsibleSurname: gar.responsibleSurname,
        responsibleAddressLine1: gar.responsibleAddressLine1,
        responsibleAddressLine2: gar.responsibleAddressLine2,
        responsibleTown: gar.responsibleTown,
        responsiblePostcode: gar.responsiblePostcode,
        responsibleCounty: gar.responsibleCounty,
        responsibleContactNo: gar.responsibleContactNo,
      };

      cookie.setGarResponsiblePerson(responsiblePerson);
      res.render('app/garfile/responsibleperson/index', { cookie });
    })
    .catch((err) => {
      logger.error('API failed to retrieve GAR');
      logger.error(err);
      res.render('app/garfile/responsibleperson/index', { cookie, errors: [{message: "Problem retrieving GAR"}] });
    });
};
