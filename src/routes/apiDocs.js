/**
 * Copyright (c) 2022
 *
 * long description for the file
 *
 * @summary Operations on users
 * @author Jorge Jimenez <jimenezjorge717@gmail.com>
 *
 */
const path = require('path')
const express = require('express')
const router = new express.Router()

router.get('/api/docs', (req, res) => {
    filePath = path.join(__dirname, '../../public/api/redoc-static.html')
    res.sendFile(filePath)
})

module.exports = router
