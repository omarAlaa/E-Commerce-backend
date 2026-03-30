const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        select: false
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        title: String,
        price: Number,
        image: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    subtotal: Number,
    status: String
})

const order = mongoose.model('Order', orderSchema)
module.exports = order