require('dotenv').config();
var dbConfig = {
    type: "mysql",
    entities: ["**/*.entity.js"],
    host: "localhost",
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: true,

};


switch (process.env.NODE_ENV) {
    case 'development':
        Object.assign(dbConfig, {
            database: 'nest_enterprise_arch_test', // unique database, this will make nestjs create a db.sqlite databse file for us

        });
        break;

    case 'production':
        Object.assign(dbConfig, {
            database: 'nest_enterprise_arch_prod'
        });
        break;

    case 'test':
        Object.assign(dbConfig, {
            database: 'nest_enterprise_arch_test'
        });
        break;

    default:
        Object.assign(dbConfig, {
            database: 'nest_enterprise_arch_test', // unique database, this will make nestjs create a db.sqlite databse file for us

        });   
    // throw new Error("no environment found");

}

module.exports = dbConfig;