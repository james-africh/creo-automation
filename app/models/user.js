module.exports = function(sequelize, Sequelize) {

    var User = sequelize.define('user', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },

        password: {
            type: Sequelize.STRING,
            allowNull: false
        },

        token: {
            type: Sequelize.STRING,
            defaultValue: null
        },

        isVerified:{
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        last_login: {
            type: Sequelize.DATE,
            defaultValue: new Date()
        },

        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }


    });

    return User;

};