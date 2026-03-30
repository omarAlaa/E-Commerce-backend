const Cart = require('../models/cart')

const getCart = async (req, res, next) => {
    const userId = req.user.id

    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product')

        return res.status(200).json(cart?.items || null)
    } catch (error) {
        next(error)
    }
}

const addToCart = async (req, res, next) => {
    const userId = req.user.id

    const { productId } = req.params

    try {
        let cart = await Cart.findOne({ user: userId })

        if (!cart) {
            cart = new Cart({ user: userId, items: [] })
        }

        cart.items.push({ product: productId, quantity: 1 })

        await cart.save()

        await cart.populate('items.product')

        return res.status(200).json(cart.items)
    } catch (error) {
        next(error)
    }
}

const updateQuantity = async (req, res, next) => {
    const userId = req.user.id

    const { productId } = req.params

    const { quantity } = req.body

    try {
        let cart = await Cart.findOne({ user: userId })

        const itemIndex = cart.items.findIndex(item => item.product.equals(productId))
        cart.items[itemIndex].quantity += quantity

        await cart.save()

        await cart.populate('items.product')

        return res.status(200).json(cart.items)
    } catch (error) {
        next(error)
    }
}

const deleteFromCart = async (req, res, next) => {
    const userId = req.user.id

    const { productId } = req.params

    try {
        let cart = await Cart.findOne({ user: userId })

        const itemIndex = cart.items.findIndex(item => item.product.equals(productId))
        cart.items.splice(itemIndex, 1)

        if (cart.items.length === 0) {
            await cart.deleteOne()

            return res.status(200).json(null)
        }
        else {
            await cart.save()

            await cart.populate('items.product')

            return res.status(200).json(cart.items)
        }
    } catch (error) {
        next(error)
    }
}

const emptyCart = async (req, res, next) => {
    const userId = req.user.id

    try {
        await Cart.findOneAndDelete({ user: userId })

        return res.status(200).send()
    } catch (error) {
        next(error)
    }
}

module.exports = { getCart, addToCart, updateQuantity, deleteFromCart, emptyCart }