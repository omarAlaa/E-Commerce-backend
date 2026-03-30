const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    image: String
})

const category = mongoose.model('Category', categorySchema)
module.exports = category