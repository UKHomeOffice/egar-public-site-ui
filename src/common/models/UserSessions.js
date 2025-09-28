export default (sequelize, DataTypes) => {
  const UserSessions = sequelize.define('UserSessions', {
    Id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('uuid_generate_v4()'),
    },
    MFAToken: {
      type: DataTypes.INTEGER,
      required: true,
    },
    Email: {
      type: DataTypes.STRING,
      required: true,
    },
    ClientIPAddress: {
      type: DataTypes.STRING,
      required: true,
    },
    Status: {
      type: DataTypes.BOOLEAN,
      required: true,
    },
    IssuedTimestamp: {
      type: DataTypes.DATE,
      required: true,
    },
    StatusChangedTimestamp: {
      type: DataTypes.DATE,
      required: true,
    },
    NumAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'UserSessions',
  });

  return UserSessions;
};
