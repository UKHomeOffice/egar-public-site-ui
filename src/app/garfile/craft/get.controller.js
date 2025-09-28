/* eslint-disable no-underscore-dangle */
import CookieModel from '../../../common/models/Cookie.class.js';

import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import craftApi from '../../../common/services/craftApi.js';
import garApi from '../../../common/services/garApi.js';
import pagination from '../../../common/utils/pagination.js';

export default (req, res) => {
  logger.debug('In garfile/craft get controller');

  // Clear existing editcraft
  const cookie = new CookieModel(req);
  const currentPage = pagination.getCurrentPage(req, '/garfile/craft');

  const userRole = cookie.getUserRole();
  const userId = cookie.getUserDbId();

  garApi.get(cookie.getGarId())
    .then((garApiResponse) => {
      const gar = JSON.parse(garApiResponse);
      if ((gar.registration !== null || gar.registration !== 'Undefined') && req.headers.referer.indexOf('garfile/craft') < 0) {
        cookie.setGarCraft(gar.registration, gar.craftType, gar.craftBase);
      }

      // Create Promise representing the API call, depending on whether it is
      // for an individual or an organisation
      const apiCall = userRole === 'Individual' ? craftApi.getCrafts(userId, currentPage) : craftApi.getOrgCrafts(cookie.getOrganisationId(), currentPage);
      apiCall.then((values) => {
        const garCraft = (JSON.parse(values));

        if (garCraft.items.length > 0) {
          const { totalPages, totalItems } = garCraft._meta;
          const paginationData = pagination.build(req, totalPages, totalItems);
          cookie.setSavedCraft(JSON.parse(values));

          res.render('app/garfile/craft/index', { cookie, pages: paginationData });
          return;
        }
        res.render('app/garfile/craft/index', { cookie });
      }).catch((err) => {
        logger.error('Failed to get Saved Crafts from API');
        logger.error(err);
        res.render('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting aircraft information' }] });
      });
    })
    .catch((err) => {
      logger.error('Failed to get GAR from API');
      logger.error(err);
      res.render('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting GAR information' }] });
    });
};
