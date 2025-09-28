/* eslint-disable no-undef */

import { sequelize, dataTypes, checkModelName, checkPropertyExists } from 'sequelize-test-helpers';

import '../../global.test.js';
import SessionModel from '../../../common/models/Session.js';

describe('Session model', () => {
  const Model = SessionModel(sequelize, dataTypes);
  const instance = new Model();
  checkModelName(Model)('Session');
  context('properties', () => {
    ['sid', 'sess', 'expire'].forEach(checkPropertyExists(instance));
  });
});
