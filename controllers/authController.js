const bcrypt = require("bcrypt")
const mongoose = require('mongoose')
const User = require('../models/user')
const Cart = require('../models/cart')

const generateToken = require('../utils/generateToken')

const register = async (req, res, next) => {
    const { email, userName, password, cartItems } = req.body

    let user, cart, session

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        session = await mongoose.startSession()

        await session.withTransaction(async () => {
            user = await User.create([{
                email,
                userName,
                password: hashedPassword,
                role: 'user'
            }], { session })

            if (cartItems) {
                cart = await Cart.create([{
                    user: user[0]._id,
                    items: cartItems
                }], { session })

                cart = await cart[0]?.populate('items.product')
            }
        })

        user[0].password = undefined
        const token = generateToken(user[0])

        return res.status(201).json({ user: { ...user[0]._doc, token }, cart: cart?.items })
    }
    catch (error) {
        next(error)
    } finally {
        if (session) {
            session.endSession()
        }
    }
}

const login = async (req, res, next) => {
    const { email, password, cartItems } = req.body

    let cart

    try {
        const user = await User.findOne({ email }).select('+password')

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Wrong username or password' })
        }
        else {
            if (user.role === 'user') {
                cart = await Cart.findOne({ user: user._id })

                if (!cart && cartItems) {
                    cart = await Cart.create({
                        user: user._id,
                        items: cartItems
                    })
                }

                cart = await cart?.populate('items.product')
            }

            user.password = undefined
            const token = generateToken(user)

            return res.status(200).json({ user: { ...user._doc, token }, cart: cart?.items })
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = { register, login }