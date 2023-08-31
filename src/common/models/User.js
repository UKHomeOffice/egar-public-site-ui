//javascript
   // models/User.js (Sequelize v6)
   const { Sequelize } = require('sequelize');
   const sequelize = new Sequelize(/* database config */);

   const UserModel = require('./models/User')(sequelize);
   const { DataTypes } = require('sequelize');

   module.exports = (sequelize) => {
     const User = sequelize.define('User', {

       Id: {
         type: DataTypes.UUID,
         primaryKey: true,
         defaultValue: DataTypes.UUID,
         },
       firstName: {
         type: DataTypes.String,
         allowNull: false,
           },
       lastName: {
         type: DataTypes.String,
         allowNull: false,
       username: {
         type: DataTypes.STRING,
         allowNull: false
              },
       email: {
         type: DataTypes.STRING,
         allowNull: false
       }
     });

     return User;
   };
