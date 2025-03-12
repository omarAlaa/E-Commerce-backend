const express = require('express')
const app = express()
const cors = require("cors")
const bcrypt = require("bcrypt")
const mongoose = require('mongoose')
const userInfo = require('./models/userInfo')
const product = require('./models/product')
const order = require('./models/order')
const cart = require('./models/cart')

app.use(express.json())
app.use(cors())

const dbURI = 'mongodb+srv://omaralaa:epass2025@e-commerce.xsa3f.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=E-commerce'
mongoose.connect(dbURI)
    .then(() => {
        console.log("Connected to database")
        app.listen(5000, () => {
            console.log('server is listening on port 5000')
        });
    })
    .catch((e) => console.log(e));

app.post('/register', async (req, res) => {
    const {email, userName, password} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        
        const oldUser = await userInfo.findOne({ email })
        const usedUserName = await userInfo.findOne({ userName })

        if(oldUser){
            return res.status(401).send('user exists')
        }

        if(usedUserName){
            return res.status(402).send('username used')
        }

        await userInfo.create({
            email: email,
            userName: userName,
            password: hashedPassword,
            role: 'user'
        })
        res.status(200).send('ok')
    } catch (error) {
        res.status(404).send('error')
    }
})

app.post('/login', async (req, res) =>{
    const {email, password} = req.body
    try{
        const user = await userInfo.findOne({ email })

    if( !user || !await bcrypt.compare(password, user.password)){
        return res.status(401).send('wrong credintials')
    }
    else{
        return res.status(200).json({role: user.role, userName: user.userName, id: user._id})
    }
    } catch(e){
        res.status(404).send('error')
    }
    
})

app.post('/addProduct', async(req, res) =>{
    const {title, price, description, category, image} = req.body

    try{

        const oldProduct = await product.findOne({title})

        if(oldProduct){
            return res.status(401).send()
        }

        await product.create({
            title: title,
            price: price,
            description: description,
            category: category,
            image: image,
            rate: {rating: 0, count: 0}
        })

        res.status(200).send()

    }catch(e){
        res.status(404).send()
    }
})

app.get('/usersAndAdmins', async (req,res) =>{

    try{
        const users = await userInfo.find({role: 'user'}, 'email userName role')
        const admins = await userInfo.find({role: 'admin'}, 'email userName role')

        res.status(200).json({users, admins})
        
    }catch(e){

        res.status(500).send()

    }
})

app.put('/changeRole', async (req, res) =>{
    try{
        const {email, newRole} = req.body
        await userInfo.updateOne({email: email}, {role: newRole})
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.get('/products', async (req, res) =>{
    
    try{
        const products = await product.find()
        res.status(200).json(products)
    }catch(e){
        res.status(404).send()
    }
    
})

app.get('/product/:id', async (req, res) =>{
    
    try{
        const {id} = req.params
        const singleProduct = await product.findById(id)
        if(!singleProduct){
           return res.status(404).send()
        }
        res.status(200).json(singleProduct)
    }catch(e){
        res.status(500).send()
    }
    
})

app.get('/products/:category', async (req, res) =>{
    try{
        const {category} = req.params
        const products = await product.find({category})
        if(!products){
            return res.status(404).send()
        }
        res.status(200).json(products)
    }catch(e){
        res.status(500).send()
    }

})

app.delete('/deleteProduct/:title', async (req, res) =>{
    try{
        const {title} = req.params
        await product.deleteOne({title})
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.put('/updateProduct/:id', async (req, res) =>{
    try{
        const {id} = req.params
        const updatedData = req.body
        await product.updateOne({ _id: id },{ $set: updatedData });
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.delete('/deleteUser/:email', async (req, res) =>{
    try{
        const {email} = req.params
        await userInfo.deleteOne({email})
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.get('/categories', async (req, res) =>{
    try{
        const categories = await product.distinct("category")
        res.status(200).json(categories)
    }catch(e){
        res.status(500).send()
    }
})

app.post('/addOrder', async (req, res) =>{
    try{
        const {userName, items, subtotal} = req.body
        await order.create({
            userName: userName,
            items: items,
            subtotal: subtotal
        })
        res.status(200).send()
    }catch(e){
        re.status(500).send()
    }
})

app.get('/orders/:userName', async (req, res) =>{
    try{
        const {userName} = req.params
        const orders = await order.find({ userName: userName })
        if(!orders){
            res.status(404).send()
        }else{
            res.status(200).json(orders)
        }
    }catch(e){
        res.status(500).send()
    }
})

app.get('/allOrders', async (req, res) =>{
    try{
        const orders = await order.find()
        res.status(200).json(orders)
    }catch(e){
        res.status(500).send()
    }
})

app.put('/changeUsername/:id', async (req, res) =>{
    try{
        const {id} = req.params
        const {newUsername} = req.body
        const oldUsername = await userInfo.findOne({userName: newUsername})
        if(oldUsername){
            return res.status(401).send()
        }
        await userInfo.findByIdAndUpdate(id, {userName: newUsername})
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.put('/changePassword/:id', async (req, res) =>{
    try{
        const {id} = req.params
        const {newPassword} = req.body
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await userInfo.findByIdAndUpdate(id, {password: hashedPassword})
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.delete('/deleteAccount/:id', async (req, res) =>{
    try{
        const {id} = req.params
        await userInfo.findByIdAndDelete(id)
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.delete('/cancelOrder/:id', async (req, res) =>{
    try{
        const {id} = req.params
        await order.findByIdAndDelete(id)
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.put('/updateOrder/:id', async(req, res) =>{
    try{
        const {id} = req.params
        const dialogOrder = req.body
        await order.updateOne({ _id: id },{ $set: dialogOrder });
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.post('/cart/add', async (req, res) =>{
    try{
        const { userName, productId, title, image, price } = req.body

    try {
        let userCart = await cart.findOne({ userName })

        if (!userCart) {
            // Create a new cart if it doesn't exist
            userCart = new cart({ userName, items: [], subtotal: 0 })
        }

        // Check if the product is already in the cart
        const itemIndex = userCart.items.findIndex(item => item.productId === productId)

        if (itemIndex > -1) {
            // Update quantity if product exists
            userCart.items[itemIndex].quantity += 1
            userCart.subtotal += price
        } else {
            // Add new product
            userCart.items.push({ productId, quantity: 1, title, image, price})
            userCart.subtotal += price
        }

        await userCart.save()
        res.status(200).send()
    } catch (error) {
        console.error(error);
        res.status(500).send()
    }
    }catch(e){
        res.status(500).send()
    }
})

app.get('/cart/get/:userName', async (req, res) =>{
    try{
        const {userName} = req.params
        const userCart = await cart.findOne({userName})
        if(!userCart){
            res.status(404).send()
        }else{
            res.status(200).json(userCart)
        }
    }catch(e){
        res.status(500).send()
    }
})

app.put('/cart/update', async (req, res) =>{
    try{
        const { userName, productId, quantity } = req.body
        let userCart = await cart.findOne({userName})
        const itemIndex = userCart.items.findIndex(item => item.productId === productId)
        userCart.items[itemIndex].quantity += quantity
        userCart.subtotal += (quantity*userCart.items[itemIndex].price)
        await userCart.save()
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.delete('/cart/deleteProduct', async (req, res) =>{
    try{
        const { userName, productId } = req.body
        let userCart = await cart.findOne({userName})
        const itemIndex = userCart.items.findIndex(item => item.productId === productId)
        userCart.subtotal -= (userCart.items[itemIndex].price*userCart.items[itemIndex].quantity)
        userCart.items.splice(itemIndex, 1);
        if (userCart.items.length === 0) {
            await cart.deleteOne({ userName });
            return res.status(200).send();
        }
        await userCart.save()
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

app.delete('/cart/emptyCart', async (req, res) =>{
    try{
        const {userName} = req.body
        await cart.findOneAndDelete({userName})
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})