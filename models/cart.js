const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: "User",
        required: true
    },
    items: [{
        productId: String,
        quantity: Number,
        title: String,
        image: String,
        price: Number
    }],
    subtotal: Number
})

const cart = mongoose.model('Cart', cartSchema)
module.exports = cart