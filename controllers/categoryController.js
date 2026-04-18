const Category = require('../models/category')

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ _id: -1 })

        return res.status(200).json(categories)
    } catch (error) {
        next(error)
    }
}

const addCategory = async (req, res, next) => {
    const { name, imageURL } = req.body

    try {
        const category = await Category.create({
            name,
            imageURL
        })

        return res.status(200).json(category)
    } catch (error) {
        next(error)
    }
}

const deleteCategory = async (req, res, next) => {
    const { categoryId } = req.params

    try {
        await Category.findByIdAndDelete(categoryId)

        return res.status(200).send()
    } catch (error) {
        next(error)
    }
}

module.exports = { getCategories, addCategory, deleteCategory }