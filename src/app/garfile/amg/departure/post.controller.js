const logger = require('../../../../common/utils/logger')(__filename);


module.exports = (req, res) => {
    logger.debug('In garfile/amg/checkin post controller');
    res.redirect('/garfile/amg/departurestatus');
};