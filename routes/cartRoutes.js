const express = require('express')
const router = express.Router()

const { getCart, addToCart, updateQuantity, deleteFromCart, emptyCart } = require('../controllers/cartController')

const auth = require('../middlewares/authMiddleware')

router.get('/', auth, getCart)
router.post('/:productId', auth, addToCart)
router.put('/:productId', auth, updateQuantity)
router.delete('/deleteProduct/:productId', auth, deleteFromCart)
router.delete('/empty', auth, emptyCart)

module.exports = router
