const Order = require('../models/order')
const Cart = require('../models/cart')

const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().sort({ _id: -1 })

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders yet' })
        }

        return res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}

const getUserOrders = async (req, res, next) => {
    const userId = req.user.id

    try {
        const orders = await Order.find({ user: userId }).sort({ _id: -1 })

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders yet' })
        }

        return res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}

const addOrder = async (req, res, next) => {
    const userId = req.user.id

    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product')

        let items = []
        let subtotal = 0

        for (const item of cart.items) {
            items.push({
                product: item.product._id,
                title: item.product.title,
                price: item.product.price,
                image: item.product.image,
                quantity: item.quantity
            })

            subtotal += item.product.price * item.quantity
        }

        const order = await Order.create({
            user: userId,
            items,
            subtotal,
            status: 'paid'
        })

        await Cart.deleteOne({ user: userId })

        return res.status(200).json(order._id)
    } catch (error) {
        next(error)
    }
}

const updateOrder = async (req, res, next) => {
    const { orderId } = req.params
    const { status } = req.body

    try {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true })

        return res.status(200).json(updatedOrder)
    } catch (error) {
        next(error)
    }
}

module.exports = { getAllOrders, getUserOrders, addOrder, updateOrder }