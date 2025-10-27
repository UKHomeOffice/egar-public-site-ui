module.exports = (sequelize, DataTypes) => {
  const WhiteList = sequelize.define(
    'WhiteList',
    {
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
    }
  );

  return WhiteList;
};
