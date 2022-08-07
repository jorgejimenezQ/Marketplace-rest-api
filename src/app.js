const express = require('express')
const messageRouter = require('./routes/message.js')
const userRouter = require('./routes/user.js')
const productRouter = require('./routes/product.js')
const offerRouter = require('./routes/offer.js')
const publicRouter = require('./routes/assets.js')
const productImageRouter = require('./routes/productImage.js')
const userImageRouter = require('./routes/userImage.js')
const apiDocs = require('./routes/apiDocs.js')

const path = require('path')

require('./db/mongoose.js')

// Get the express object
const app = express()

// Have express use the routers
app.use(express.json())
app.use(userRouter)
app.use(productRouter)
app.use(messageRouter)
app.use(offerRouter)
app.use(publicRouter)
app.use(productImageRouter)
app.use(userImageRouter)
app.use(apiDocs)

module.exports = app

// ===============================================
// ===============================================
// ===============================================
