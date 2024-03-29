const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let isOpen = false;
let mongo = null;

module.exports.connect = async function(url) {
    if (isOpen) return;

    const mongooseOpts = {
        dbName: process.env.MONGODB_NAME || 'thesis_db'
    };

    if (!url) {
        mongo = await MongoMemoryServer.create();
        url = mongo.getUri();
    }
    
    await mongoose.connect(url, mongooseOpts);
    isOpen = true;
}

module.exports.startSession = async function() {
    return await mongoose.startSession();
}

module.exports.close = async function() {
    if (!isOpen) return;

    await mongoose.connection.close();
    if (mongo) {
        await mongo.stop();
        mongo = null;
    }

    isOpen = false;
}
