const express = require('express')
const router = express.Router()

const { getAllOrders, getUserOrders, addOrder, updateOrder, cancelOrder } = require('../controllers/orderController')

const auth = require('../middlewares/authMiddleware')
const isAdmin = require('../middlewares/isAdminMiddleware')

router.get('/', auth, isAdmin, getAllOrders)
router.get('/userOrders', auth, getUserOrders)
router.post('/', auth, addOrder)
router.put('/:orderId', auth, isAdmin, updateOrder)

module.exports = router