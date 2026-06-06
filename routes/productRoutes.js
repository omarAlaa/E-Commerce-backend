const express = require('express')
const router = express.Router()

const { getProducts, getProduct, getCategoryProducts, getNewArrivals, getPopularProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController')

const auth = require('../middlewares/authMiddleware')
const isAdmin = require('../middlewares/isAdminMiddleware')

router.get('/allProducts', getProducts)
router.get('/newArrivals', getNewArrivals)
router.get('/popularProducts', getPopularProducts)
router.get('/:productId', getProduct)
router.get('/categoryProducts/:category/:page', getCategoryProducts)
router.post('/', auth, isAdmin, addProduct)
router.put('/:productId', auth, isAdmin, updateProduct)
router.delete('/:productId', auth, isAdmin, deleteProduct)

module.exports = router