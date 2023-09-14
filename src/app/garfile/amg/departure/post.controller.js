const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const garApi = require('../../../../common/services/garApi');


const performAPICall = (cookie, res, exceptions) => {
    garApi.postGarPassengerConfirmations(cookie.getGarId(), exceptions)
        .then((apiResponse) => {
            res.redirect('/garfile/amg/departurestatus');
        })
        .catch((err) => {
            logger.error('Api failed to post GAR exceptions');
            logger.error(err);
            res.render('app/home', {
                cookie,
                errors: [{
                    message: 'Failed to post GAR confirmation|exceptions',
                }],
            });
        });
};

module.exports = (req, res) => {
    const exceptions = req.body.exceptions === undefined ? [] : req.body.exceptions;
    const cookie = new CookieModel(req);


    logger.debug("Exceptions");
    logger.debug(exceptions)
    logger.debug('In garfile/amg/checkin post controller');

    performAPICall(cookie, res, exceptions);
};