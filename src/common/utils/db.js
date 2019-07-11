const Sequelize = require('sequelize');
const config = require('../config/index');

const sequelize = new Sequelize(config.PUBLIC_SITE_DBNAME,
  config.PUBLIC_SITE_DBUSER,
  config.PUBLIC_SITE_DBPASSWORD, {
    host: config.PUBLIC_SITE_DBHOST,
    port: config.PUBLIC_SITE_DBPORT,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

sequelize.import('../models/UserSessions');
sequelize.import('../models/WhiteList');

module.exports.Sequelize = Sequelize;
module.exports.sequelize = sequelize;
module.exports.UserSessions = require('../models/UserSessions')(sequelize, Sequelize);
module.exports.WhiteList = require('../models/WhiteList')(sequelize, Sequelize);

module.exports.op = Sequelize.Op;
