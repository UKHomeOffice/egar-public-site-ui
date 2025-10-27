const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists,
} = require('sequelize-test-helpers');

require('../../global.test');
const SessionModel = require('../../../common/models/Session');

describe('Session model', () => {
  const Model = SessionModel(sequelize, dataTypes);
  const instance = new Model();
  checkModelName(Model)('Session');
  context('properties', () => {
    ['sid', 'sess', 'expire'].forEach(checkPropertyExists(instance));
  });
});
