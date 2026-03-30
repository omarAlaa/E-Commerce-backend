const express = require('express')
const router = express.Router()

const { getCategories, addCategory, deleteCategory } = require('../controllers/categoryController')

const auth = require('../middlewares/authMiddleware')
const isAdmin = require('../middlewares/isAdminMiddleware')

router.get('/', getCategories)
router.post('/', auth, isAdmin, addCategory)
router.delete('/:categoryId', auth, isAdmin, deleteCategory)

module.exports = router