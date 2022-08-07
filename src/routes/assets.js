const express = require('express')
const path = require('path')

// Router
const router = express.Router()

// Example url for localhost
// http://localhost:3000/assets/product/cc3bf47809b28.png
// Set up the path for public assets
const publicPath = path.join(__dirname, '../../public')
router.use('/assets', express.static(publicPath))

module.exports = router
