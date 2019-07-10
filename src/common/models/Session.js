module.exports = (sequelize, DataTypes) => {
  const session = sequelize.define('session', {
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
  });

  session.schema('public');

  return session;
};
