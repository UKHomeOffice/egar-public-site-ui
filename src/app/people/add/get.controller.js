const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');
const persontype = require('../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../common/seeddata/egar_gender_choice.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In people / add get controller');
  res.render('app/people/add/index', { cookie, genderchoice, persontype, documenttype });
};
