const uuid = require('uuid/v4');
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const WhiteList = sequelize.define('WhiteList', {
    Id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('uuid_generate_v4()'),
    },
    email: {
      type: DataTypes.STRING,
      required: true,
    },
  },
  {
    tableName: 'WhiteList',
  });

  WhiteList.schema('public');
  return WhiteList;
};
