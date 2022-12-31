const mongoose = require('mongoose');


module.exports.init = () => {
    const dbOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    mongoose.connect(Config.mongo, dbOptions);
    mongoose.Promise = global.Promise;

    mongoose.connection.on('connected', () => {
        console.log('[SUCCESS] Mongoose has successfully connected!');
    });

    mongoose.connection.on('err', err => {
        console.error(`[ERROR] Mongoose connection error: \n${err.stack}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('[WARN] Mongoose connection lost');
    });
}