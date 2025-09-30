module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    'Session',
    {
      sid: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      sess: {
        allowNull: false,
        type: DataTypes.JSON,
        required: true,
      },
      expire: {
        allowNull: false,
        type: DataTypes.DATE,
        required: true,
      },
    },
    {
      tableName: 'session',
      timestamps: false,
    }
  );

  return Session;
};
