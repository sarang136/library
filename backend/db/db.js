const mongoose = require('mongoose');

const connectDb = async () => {
    await mongoose.connect(process.env.CLUSTER)
}


module.exports = connectDb;