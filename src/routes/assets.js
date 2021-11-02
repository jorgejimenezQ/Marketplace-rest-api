const express = require('express')
const path = require('path')

// Router
const router = express.Router()

// Set up the path for public assets
const publicPath = path.join(__dirname, '../../public')
router.use('/assets', express.static(publicPath))

module.exports = router
