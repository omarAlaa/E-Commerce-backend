const express = require('express')
const router = express.Router()

const { getUsers, getAdmins, changeUsername, changePassword, deleteAccount, makeAdmin, deleteUser } = require('../controllers/userController')

const auth = require('../middlewares/authMiddleware')
const isAdmin = require('../middlewares/isAdminMiddleware')

router.get('/users', auth, isAdmin, getUsers)
router.get('/admins', auth, isAdmin, getAdmins)
router.patch('/makeAdmin/:userId', auth, isAdmin, makeAdmin)
router.delete('/deleteUser/:userId', auth, isAdmin, deleteUser)
router.patch('/changeUsername', auth, changeUsername)
router.patch('/changePassword', auth, changePassword)
router.delete('/deleteAccount', auth, deleteAccount)

module.exports = router