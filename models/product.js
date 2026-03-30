const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true
    },
    price: Number,
    description: String,
    category: String,
    image: String,
    rate: {
        rating: Number,
        count: Number
    }
})

const product = mongoose.model('Product', productSchema)
module.exports = product