const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);

  try {
    const newCreatedDate = new Date().toISOString();
    const garId = cookie.getGarId();
    const createdDate = cookie.getGarCreatedDate();

    logger.debug(`In garfile / amend post controller - User: ${cookie.getUserDbId()} editing GAR: ${garId}`);
    logger.info(`gar ${garId} old createdDate ${createdDate} is going to be ${newCreatedDate}`);

    await garApi.patch(garId, 'Draft', { createdDate: newCreatedDate });
    cookie.setGarCreatedDate(newCreatedDate);

    req.session.successHeader = 'GAR Amendment';
    req.session.save(() => {
      res.redirect('/garfile/view');
    });
  } catch (err) {
    logger.error(err);
    res.render('app/garfile/amend/index', {
      cookie,
      errors: [
        {
          message: 'Something went wrong trying to amend the GAR. Please try again or contact support',
        },
      ],
    });
  }
};
