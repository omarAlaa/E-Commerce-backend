const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userName: {
        type: String,
        ref: "User",
        required: true
    },
    items: [{
        productId: String,
        quantity: Number,
        name: String,
        image: String,
        price: Number
    }],
    subtotal: Number
})

const order = mongoose.model('Order', orderSchema)
module.exports = order