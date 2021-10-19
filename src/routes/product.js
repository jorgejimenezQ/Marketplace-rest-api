/**
 * Copyright (c) 2017
 *
 * long description for the file
 *
 * @summary Operations on product, see the market-oas.yaml file.
 * @author Jorge Jimenez <jimenezjorge717@gmail.com>
 *
 */

const express = require('express')
const authentication = require('../middleware/auth.js')
const User = require('../models/user.js')
const Product = require('../models/product.js')
const authenticate = require('../middleware/auth.js')

const router = express.Router()

// Post a product
router.post('/products', authenticate, async (req, res) => {
    try {
        const product = new Product({
            owner: req.user._id,
            ...req.body, // Get the request body
        })

        const itemNumber = await product.generateItemNumber()
        product.itemNumber = itemNumber

        await product.save()
        if (!product) {
            res.status(400).send
        }

        // Populate the username of the owner
        await product.populate('owner', 'username')

        // SEND!!
        res.send(product)
    } catch (e) {
        res.status(400).send('Unable to create product.')
    }
})

module.exports = router
