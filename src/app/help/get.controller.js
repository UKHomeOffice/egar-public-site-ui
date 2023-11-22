const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  logger.debug('In help get controller');

  if(req.query.tab && req.query.tab.toUpperCase() === 'UPT' ){
    res.render('app/help/upt');
  }
  else{
    res.render('app/help/index');
  }
  
};
