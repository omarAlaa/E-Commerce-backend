const Product = require('../models/product')

const getProducts = async (req, res, next) => {
    try {
        const { page } = req.params

        const totalProducts = await Product.countDocuments()
        const totalPages = Math.ceil(totalProducts / 10)

        const start = (page - 1) * 10

        const products = await Product.find().sort({ _id: -1 }).skip(start).limit(10)

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products yet' })
        }

        return res.status(200).json({ products, totalPages })
    } catch (error) {
        next(error)
    }
}

const getProduct = async (req, res, next) => {
    try {
        const { productId } = req.params

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ message: 'Product might be deleted' })
        }

        return res.status(200).json(product)
    } catch (error) {
        next(error)
    }
}

const getCategoryProducts = async (req, res, next) => {
    try {
        const { category, page } = req.params

        const totalProducts = await Product.find({ category }).countDocuments()
        const totalPages = Math.ceil(totalProducts / 10)

        const start = (page - 1) * 10

        const products = await Product.find({ category }).sort({ _id: -1 }).skip(start).limit(10)

        if (!products) {
            return res.status(404).json({ message: 'No products in this category' })
        }

        return res.status(200).json({ products, totalPages })
    } catch (error) {
        next(error)
    }
}

const getNewArrivals = async (req, res, next) => {
    try {
        const newArrivals = await Product.find().sort({ _id: -1 }).limit(5)

        if (newArrivals.length === 0) {
            return res.status(404).json({ message: 'No products yet' })
        }

        return res.status(200).json(newArrivals)
    } catch (error) {
        next(error)
    }
}

const getPopularProducts = async (req, res, next) => {
    try {
        const popularProducts = await Product.find().sort({ 'rate.rating': -1 }).limit(10)

        if (popularProducts.length === 0) {
            return res.status(404).json({ message: 'No products yet' })
        }

        return res.status(200).json(popularProducts)
    } catch (error) {
        next(error)
    }
}

const addProduct = async (req, res, next) => {
    try {
        const { title, price, description, category, image } = req.body

        const product = await Product.create({
            title,
            price,
            description,
            category,
            image,
            rate: { rating: 0, count: 0 }
        })

        return res.status(200).json(product)
    } catch (error) {
        next(error)
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const { productId } = req.params
        const { updatedProduct } = req.body

        await Product.findByIdAndUpdate(productId, updatedProduct)

        return res.status(200).json(updatedProduct)
    } catch (error) {
        next(error)
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const { productId } = req.params

        await Product.findByIdAndDelete(productId)

        return res.status(200).send()
    } catch (error) {
        next(error)
    }
}

module.exports = { getProducts, getProduct, getCategoryProducts, getNewArrivals, getPopularProducts, addProduct, updateProduct, deleteProduct }