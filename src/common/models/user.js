module.exports = (sequelize, DataTypes) => {
  const FunctionType = sequelize.define('User', {

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
  FunctionType.schema('public');
  return FunctionType;
};
