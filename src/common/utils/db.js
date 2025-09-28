import Sequelize from 'sequelize';
import config from '../config/index.js';

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

import UserSessionsModel from '../models/UserSessions.js';
import WhiteListModel from '../models/WhiteList.js';
import SessionModel from '../models/Session.js';

const UserSessions = UserSessionsModel(sequelize, Sequelize);
const WhiteList = WhiteListModel(sequelize, Sequelize);
const Session = SessionModel(sequelize, Sequelize);

export default {
  Sequelize,
  sequelize,
  UserSessions,
  WhiteList,
  Session,
  op: Sequelize.Op,
};