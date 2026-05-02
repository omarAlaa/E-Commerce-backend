const errorMiddleware = (error, req, res, next) => {
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0]
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`

        return res.status(409).json({ message })
    }

    return res.status(500).json({ message: 'Error occured, please try again later' })
}

module.exports = errorMiddleware