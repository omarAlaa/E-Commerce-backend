const Order = require('../models/order')
const Cart = require('../models/cart')
const User = require('../models/user')

const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, search = "", status } = req.query
        const limit = 10
        const skip = (Number(page) - 1) * limit

        const query = {};
        if (status) {
            query.status = status
        }

        if (search) {
            const matchingUsers = await User.find({
                $or: [
                    { userName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            }).select("_id")

            const userIds = matchingUsers.map(user => user._id)

            query.user = { $in: userIds }
        }

        const [orders, totalOrders] = await Promise.all([
            Order.find(query)
                .populate("user")
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(query)
        ])

        const totalPages = Math.ceil(totalOrders / limit)

        return res.status(200).json({
            orders,
            totalPages,
        })

    } catch (error) {
        next(error)
    }
}

const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { page } = req.params

        const totalOrders = await Order.countDocuments({ user: userId })
        const totalPages = Math.ceil(totalOrders / 5)

        const start = (page - 1) * 5

        const orders = await Order.find({ user: userId }).sort({ _id: -1 }).skip(start).limit(5)

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders yet' })
        }

        return res.status(200).json({ orders, totalPages })
    } catch (error) {
        next(error)
    }
}

const addOrder = async (req, res, next) => {
    try {
        const userId = req.user.id

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
    try {
        const { orderId } = req.params
        const { status } = req.body

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true })

        return res.status(200).json(updatedOrder)
    } catch (error) {
        next(error)
    }
}

module.exports = { getAllOrders, getUserOrders, addOrder, updateOrder }