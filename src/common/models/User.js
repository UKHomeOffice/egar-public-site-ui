module.exports = (sequelize, DataTypes) => {
  const UserModel = sequelize.define('User', {

    Id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING,
      required: true,
    },
    firstName: {
      type: DataTypes.String,
      required: true,
    },
    lastName: {
      type: DataTypes.String,
      required: true,
    },
    email: {
      type: DataTypes.String,
      required: true,
    },
  },
  {
    tableName: 'user', // this will define the table's name
    timestamps: false, // this will deactivate the timestamp columns
  });

  return UserModel;
};
