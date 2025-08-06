const express = require('express')
const app = express()
const cors = require("cors")
const bcrypt = require("bcrypt")
const mongoose = require('mongoose')
const userInfo = require('./models/userInfo')
const product = require('./models/product')
const order = require('./models/order')
const cart = require('./models/cart')
const category = require('./models/category')
require('dotenv').config()

app.use(express.json())
app.use(cors())


const PORT = process.env.PORT
const dbURI = process.env.MONGO_URI
mongoose.connect(dbURI)
    .then(() => {
        console.log("Connected to database")
        app.listen(PORT, () => {
            console.log(`server is listening on port ${process.env.PORT}`)
        })
    })
    .catch((e) => console.log(e))

app.post('/register', async (req, res) => {
    const { email, userName, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    try {

        const oldUser = await userInfo.findOne({ email })
        const usedUserName = await userInfo.findOne({ userName })

        if (oldUser) {
            return res.status(401).send('user exists')
        }

        if (usedUserName) {
            return res.status(402).send('username used')
        }

        await userInfo.create({
            email,
            userName,
            password: hashedPassword,
            role: 'user'
        })
        res.status(200).send('ok')
    } catch (error) {
        res.status(404).send('error')
    }
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await userInfo.findOne({ email })

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).send('wrong credintials')
        }
        else {
            return res.status(200).json({ role: user.role, userName: user.userName, id: user._id })
        }
    } catch (e) {
        res.status(404).send('error')
    }

})

app.get('/products', async (req, res) => {

    try {
        const products = await product.find()
        res.status(200).json(products)
    } catch (e) {
        res.status(404).send()
    }

})

app.get('/categories', async (req, res) => {
    try {
        const categories = await category.find()
        res.status(200).json(categories)
    } catch (e) {
        res.status(500).send()
    }
})

app.get('/products/:category', async (req, res) => {
    try {
        const { category } = req.params
        const products = await product.find({ category })
        if (!products) {
            return res.status(404).send()
        }
        res.status(200).json(products)
    } catch (e) {
        res.status(500).send()
    }

})

app.get('/newArrivals', async (req, res) => {
    try {
        const newArrivals = await product.find().sort({ _id: -1 }).limit(5)
        res.status(200).json({ newArrivals })
    } catch (error) {
        res.status(500).send()
    }
})

app.get('/popularProducts', async (req, res) => {
    try {
        const popularProducts = await product.find().sort({ 'rate.rating': -1 }).limit(10)
        res.status(200).json({ popularProducts })
    } catch (error) {
        res.status(500).send()
    }
})

app.get('/product/:id', async (req, res) => {

    try {
        const { id } = req.params
        const singleProduct = await product.findById(id)
        if (!singleProduct) {
            return res.status(404).send()
        }
        res.status(200).json(singleProduct)
    } catch (e) {
        res.status(500).send()
    }

})

app.get('/cart/get/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        const userCart = await cart.findOne({ userId })
        res.status(200).json(userCart)
    } catch (e) {
        res.status(500).send()
    }
})

app.post('/cart/add', async (req, res) => {
    try {
        const { userId, oldCart, product } = req.body
        let userCart = userId !== '' ? await cart.findOne({ userId }) : oldCart
        if (!userCart) {
            userCart = new cart({ userId, items: [], subtotal: 0 })
        }
        if (userCart.items.find(item => item.title === product.title)) {
            return res.status(403).send()
        }
        userCart.items.push({ ...product, quantity: 1 })
        userCart.subtotal += product.price
        if (userId !== '') {
            await userCart.save()
        }
        res.status(200).json({ userCart })
    } catch (error) {
        res.status(500).send()
    }
})

app.put('/cart/update', async (req, res) => {
    try {
        const { userId, oldCart, title, quantity } = req.body
        let userCart = userId !== '' ? await cart.findOne({ userId }) : oldCart
        const itemIndex = userCart.items.findIndex(item => item.title === title)
        userCart.items[itemIndex].quantity += quantity
        userCart.subtotal += (quantity * userCart.items[itemIndex].price)
        if (userId !== '') {
            await userCart.save()
        }
        res.status(200).json({ userCart })
    } catch (e) {
        res.status(500).send()
    }
})

app.delete('/cart/deleteProduct', async (req, res) => {
    try {
        const { userId, oldCart, title } = req.body
        let userCart = userId !== '' ? await cart.findOne({ userId }) : oldCart
        const itemIndex = userCart.items.findIndex(item => item.title === title)
        userCart.subtotal -= userCart.items[itemIndex].price * userCart.items[itemIndex].quantity
        userCart.items.splice(itemIndex, 1)
        if (userCart.items.length === 0 && userId !== '') {
            await cart.deleteOne({ userId })
            return res.status(200).json({ ...userCart, items: [] })
        }
        if (userId !== '') {
            await userCart.save()
        }
        res.status(200).json({ userCart })
    } catch (error) {
        res.status(500).send()
    }
})

app.delete('/cart/emptyCart', async (req, res) => {
    try {
        const { userId } = req.body
        if (userId !== '') {
            await cart.findOneAndDelete({ userId })
        }
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

app.post('/addOrder', async (req, res) => {
    try {
        const { userId, items, subtotal } = req.body
        const userOrder = await order.create({
            userId,
            items,
            subtotal
        })
        await cart.deleteOne({ userId })
        res.status(200).json({ id: userOrder._id })
    } catch (e) {
        res.status(500).send()
    }
})

app.put('/changeUsername/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { newUsername } = req.body
        const oldUsername = await userInfo.findOne({ userName: newUsername })
        if (oldUsername) {
            return res.status(401).send()
        }
        await userInfo.findByIdAndUpdate(id, { userName: newUsername })
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

app.put('/changePassword/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { newPassword } = req.body
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await userInfo.findByIdAndUpdate(id, { password: hashedPassword })
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

app.delete('/deleteAccount/:id', async (req, res) => {
    try {
        const { id } = req.params
        await userInfo.findByIdAndDelete(id)
        await cart.deleteOne({ userId: id })
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

app.get('/orders/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        const orders = await order.find({ userId })
        if (!orders) {
            res.status(404).send()
        } else {
            res.status(200).json(orders)
        }
    } catch (e) {
        res.status(500).send()
    }
})

app.post('/addProduct', async (req, res) => {
    const { title, price, description, category, image } = req.body

    try {

        const oldProduct = await product.findOne({ title })

        if (oldProduct) {
            return res.status(401).send()
        }

        await product.create({
            title: title,
            price: price,
            description: description,
            category: category,
            image: image,
            rate: { rating: 0, count: 0 }
        })

        res.status(200).send()

    } catch (e) {
        res.status(404).send()
    }
})

app.put('/updateProduct/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { dialogProduct } = req.body
        await product.findByIdAndUpdate(id, { ...dialogProduct })
        res.status(200).json({ dialogProduct })
    } catch (e) {
        res.status(500).send()
    }
})

app.delete('/deleteProduct/:id', async (req, res) => {
    try {
        const { id } = req.params
        await product.findByIdAndDelete(id)
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

app.get('/usersAndAdmins', async (req, res) => {

    try {
        const users = await userInfo.find({ role: 'user' }, 'email userName role')
        const admins = await userInfo.find({ role: 'admin' }, 'email userName role')

        res.status(200).json({ users, admins })

    } catch (e) {

        res.status(500).send()

    }
})

app.put('/changeRole', async (req, res) => {
    try {
        const { email, newRole } = req.body
        await userInfo.updateOne({ email: email }, { role: newRole })
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

app.delete('/deleteUser/:email', async (req, res) => {
    try {
        const { email } = req.params
        await userInfo.deleteOne({ email })
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

app.get('/allOrders', async (req, res) => {
    try {
        const orders = await order.find()
        res.status(200).json(orders)
    } catch (e) {
        res.status(500).send()
    }
})

app.put('/updateOrder/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { dialogOrder } = req.body
        await order.findByIdAndUpdate(id, { ...dialogOrder })
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

app.delete('/cancelOrder/:id', async (req, res) => {
    try {
        const { id } = req.params
        await order.findByIdAndDelete(id)
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

app.post('/addCategory', async (req, res) => {
    try {
        const { name, image } = req.body
        const oldCategory = await category.findOne({ name })

        if (oldCategory) {
            return res.status(402).send()
        }

        await category.create({
            name,
            image
        })
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})