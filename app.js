const express = require('express')
const cors = require("cors")

const authRoutes = require('./routes/authRoutes')
const cartRoutes = require('./routes/cartRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const orderRoutes = require('./routes/orderRoutes')
const productRoutes = require('./routes/productRoutes')
const userRoutes = require('./routes/userRoutes')

const errorMiddleware = require('./middlewares/errorMiddleware')

const app = express()

app.use(express.json())

app.use(cors({
    origin: 'https://e-commerce-frontend-opal-nu.vercel.app'
}))

app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)

app.use(errorMiddleware)

module.exports = app