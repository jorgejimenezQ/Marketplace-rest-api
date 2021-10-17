const express = require('express')
const userRouter = require('./routes/user.js')
require('./db/mongoose.js')

// Get the express object
const app = express()

// Have express use the routers
app.use(express.json())
app.use(userRouter)

module.exports = app

// ===============================================
// ===============================================
// ===============================================
