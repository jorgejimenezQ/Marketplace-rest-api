const express = require('express')
const messageRouter = require('./routes/message.js')
const userRouter = require('./routes/user.js')
const productRouter = require('./routes/product.js')

require('./db/mongoose.js')

// Get the express object
const app = express()

// Have express use the routers
app.use(express.json())
app.use(userRouter)
app.use(productRouter)
app.use(messageRouter)

module.exports = app

// ===============================================
// ===============================================
// ===============================================
