const mongoose = require('mongoose')

const dbURI = process.env.MONGO_URI

const connectDB = async () => await mongoose.connect(dbURI)

module.exports = connectDB