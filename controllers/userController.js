const mongoose = require('mongoose')
const User = require('../models/user')
const Cart = require('../models/cart')
const bcrypt = require('bcrypt')

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'user' }).sort({ _id: -1 })

        return res.status(200).json(users)
    } catch (error) {
        next(error)
    }
}

const getAdmins = async (req, res, next) => {
    try {
        const admins = await User.find({ role: 'admin' }).sort({ _id: -1 })

        return res.status(200).json(admins)
    } catch (error) {
        next(error)
    }
}

const changeUsername = async (req, res, next) => {
    const userId = req.user.id
    const { newUsername } = req.body

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { userName: newUsername }, { new: true })

        return res.status(200).json(updatedUser)
    } catch (error) {
        next(error)
    }
}

const changePassword = async (req, res, next) => {
    const userId = req.user.id
    const { newPassword } = req.body

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await User.findByIdAndUpdate(userId, { password: hashedPassword })

        return res.status(200).send()
    } catch (error) {
        next(error)
    }
}

const deleteAccount = async (req, res, next) => {
    const userId = req.user.id

    let session

    try {
        session = await mongoose.startSession()

        await session.withTransaction(async () => {
            await User.findByIdAndDelete(userId, { session })

            await Cart.deleteOne({ user: userId }, { session })
        })

        return res.status(200).send()
    } catch (error) {
        next(error)
    } finally {
        if (session) {
            session.endSession()
        }
    }
}

const makeAdmin = async (req, res, next) => {
    const { userId } = req.params

    try {
        const newAdmin = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true })

        return res.status(200).json(newAdmin)
    } catch (error) {
        next(error)
    }
}

const deleteUser = async (req, res, next) => {
    const { userId } = req.params

    let session

    try {
        session = await mongoose.startSession()

        await session.withTransaction(async () => {
            await User.findByIdAndDelete(userId, { session })

            await Cart.findOneAndDelete({ user: userId }, { session })
        })

        return res.status(200).send()
    } catch (error) {
        next(error)
    } finally {
        if (session) {
            session.endSession()
        }
    }
}

module.exports = { getUsers, getAdmins, changeUsername, changePassword, deleteAccount, makeAdmin, deleteUser }