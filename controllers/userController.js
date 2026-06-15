const mongoose = require('mongoose')
const User = require('../models/user')
const Cart = require('../models/cart')
const bcrypt = require('bcrypt')

const getUsers = async (req, res, next) => {
    try {
        const { search = "", page = 1 } = req.query

        const filter = {
            userName: { $regex: search, $options: "i" },
            role: 'user'
        }

        const start = (page - 1) * 10

        const [totalUsers, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter)
                .sort({ _id: -1 })
                .skip(start)
                .limit(10)
        ])
        const totalPages = Math.ceil(totalUsers / 10)

        return res.status(200).json({ users, totalPages })
    } catch (error) {
        next(error)
    }
}

const getAdmins = async (req, res, next) => {
    try {
        const { search = "", page = 1 } = req.query

        const filter = {
            userName: { $regex: search, $options: "i" },
            role: 'admin'
        }

        const start = (page - 1) * 10

        const [totalAdmins, admins] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter)
                .sort({ _id: -1 })
                .skip(start)
                .limit(10)
        ])
        const totalPages = Math.ceil(totalAdmins / 10)

        return res.status(200).json({ admins, totalPages })
    } catch (error) {
        next(error)
    }
}

const changeUsername = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { newUsername } = req.body

        const updatedUser = await User.findByIdAndUpdate(userId, { userName: newUsername }, { new: true })

        return res.status(200).json(updatedUser)
    } catch (error) {
        next(error)
    }
}

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { newPassword } = req.body

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await User.findByIdAndUpdate(userId, { password: hashedPassword })

        return res.status(200).send()
    } catch (error) {
        next(error)
    }
}

const deleteAccount = async (req, res, next) => {
    let session

    try {
        const userId = req.user.id

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
    try {
        const { userId } = req.params

        const newAdmin = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true })

        return res.status(200).json(newAdmin)
    } catch (error) {
        next(error)
    }
}

const deleteUser = async (req, res, next) => {
    let session

    try {
        const { userId } = req.params

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