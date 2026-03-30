const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'This page is for admins only' })
    }

    next()
}

module.exports = isAdmin