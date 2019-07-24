/* eslint-disable no-undef */

const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists,
} = require('sequelize-test-helpers');

const UserModel = require('../../../common/models/User');

describe('User model', () => {
  const Model = UserModel(sequelize, dataTypes);
  const instance = new Model();
  checkModelName(Model)('User');
  context('properties', () => {
    ['Id', 'username', 'firstName', 'lastName', 'email'].forEach(checkPropertyExists(instance));
  });
});
