require('dotenv').config()
const connectDB = require('./config/db')
const app = require('./app')

const PORT = process.env.PORT

connectDB().then(() => {
    console.log("Connected to database")
    app.listen(PORT, () => {
        console.log(`server is listening on port ${PORT}`)
    })
})
    .catch((e) => console.log(e))