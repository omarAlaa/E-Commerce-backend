const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userName: {
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