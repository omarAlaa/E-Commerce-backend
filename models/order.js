const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
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

const order = mongoose.model('Order', orderSchema)
module.exports = order