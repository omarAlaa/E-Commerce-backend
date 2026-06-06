const mongoose = require('mongoose')
const dns = require('dns')

dns.setServers([
    '1.1.1.1', '8.8.8.8'
])

const dbURI = process.env.MONGO_URI

const connectDB = async () => await mongoose.connect(dbURI)

module.exports = connectDB