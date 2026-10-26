const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const dataAccessApi = require('../../../common/services/dataAccessApi');
const garApi = require('../../../common/services/data-access/garApi');

module.exports = (req, res) => {
  // Clear existing editcraft
  const cookie = new CookieModel(req);
  const currentPage = Number(req.query.page) || 1;

  const userRole = cookie.getUserRole();
  const userId = cookie.getUserDbId();

  return garApi
    .get(res?.locals?.gar?.garId)
    .then((garApiResponse) => {
      const gar = JSON.parse(garApiResponse);
      if (
        (gar.registration !== null || gar.registration !== 'Undefined') &&
        req.headers.referer.indexOf('garfile/craft') < 0
      ) {
        cookie.setGarCraft(gar.registration, gar.craftType, gar.craftBase);
      }

      // Create Promise representing the API call, depending on whether it is
      // for an individual or an organisation
      const apiCall =
        userRole === 'Individual'
          ? dataAccessApi.craftApi.getCrafts(userId, currentPage)
          : dataAccessApi.craftApi.getOrgCrafts(cookie.getOrganisationId(), currentPage);
      return apiCall
        .then((garCraft) => {
          if (garCraft.items.length > 0) {
            const paginationData = garCraft._meta;
            cookie.setSavedCraft(garCraft);

            res.render('app/garfile/craft/index', { cookie, pages: paginationData });
            return;
          }
          res.render('app/garfile/craft/index', { cookie });
        })
        .catch((err) => {
          logger.error('Failed to get saved crafts', {
            userId,
            errorMessage: err?.message,
            stack: err?.stack,
          });
          res.render('app/garfile/craft/index', {
            cookie,
            errors: [{ message: 'There was a problem getting aircraft information' }],
          });
        });
    })
    .catch((err) => {
      logger.error('Failed to get GAR from API', { errorMessage: err?.message, stack: err?.stack });
      res.render('app/garfile/craft/index', {
        cookie,
        errors: [{ message: 'There was a problem getting GAR information' }],
      });
    });
};
