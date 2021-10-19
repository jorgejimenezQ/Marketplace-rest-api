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
const { validateUpdate } = require('../utils/utils.js')

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
            res.status(400).send('There was a problem uploading the product.')
        }

        // Populate the username of the owner
        await product.populate('owner', 'username')

        // SEND!!
        res.send(product)
    } catch (e) {
        res.status(400).send('Unable to create product.')
    }
})

// Remove a product from a user's merchandise
router.delete('/products/:itemNumber', authenticate, async (req, res) => {
    try {
        const product = await Product.findOne({
            itemNumber: req.params.itemNumber,
            owner: req.user._id,
        })

        // If product does not exist
        // or product has already been removed
        if (!product || product.removed) throw new Error()

        // If product exists under user account, set removed to true
        product.removed = true
        product.dateRemoved = Date.now()
        await product.save()

        res.send(product)
    } catch (e) {
        res.status(400).send({ error: 'Unable to delete product' })
    }
})

// Update product
/**
 *
 */
router.patch('/products/:itemNumber', authenticate, async (req, res) => {
    const updates = Object.keys(req.body)
    const isValidOperation = validateUpdate(updates, [
        'name',
        'condition',
        'price',
        'category',
        'description',
    ])

    // Check for a valid operation
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const product = await Product.findOne({
            itemNumber: req.params.itemNumber,
            owner: req.user._id,
        })

        // Check if product exists, belongs to the authenticated
        // user, and it's not deleted
        if (!product || product.removed) throw new Error()

        updates.forEach((update) => (product[update] = req.body[update]))

        // Save the updated product
        await product.save()

        // Populate the username of the owner
        await product.populate('owner', 'username')

        res.send(product)
    } catch (e) {
        res.status(400).send({ error: 'Unable to updaet product.' })
    }
})

// Get a product's owner
router.get('/products/:itemNumber/getOwner', async (req, res) => {
    try {
        // Get the product with the generateItemNumber
        // And populate the owner field
        const product = await Product.findOne({
            itemNumber: req.params.itemNumber,
        }).populate('owner')

        // If the product does not exist send error
        if (!product)
            return res.status(400).send({ error: 'Product does not exist!' })

        // console.log(product.owner)
        // All good!
        res.send(product.owner)
    } catch (e) {
        res.status(400).send({ error: 'Unable to find user' })
    }
})

// Retrieve a product's images
router.get('/products/:itemNumber/getImages', async (req, res) => {
    try {
        // Find the product with the itemNumber
        const product = await Product.findOne({
            itemNumber: req.params.itemNumber,
        })

        // If the product does not exist send error
        if (!product)
            return res.status(400).send({ error: 'Product does not exist!' })

        // The product's "images" is an array of paths, and names
        const images = product.imageURLs

        res.send(images)
    } catch (error) {
        res.status(400).send({ error: 'Unable to find images' })
    }
})

// Sell product
// This endpoint will just set the value of sold
// to true and set the dateSold to the current date
router.put('/products/:itemNumber', authenticate, async (req, res) => {
    try {
        // console.log(req.user._id)
        const product = await Product.findOne({
            itemNumber: req.params.itemNumber,
            owner: req.user._id,
        })
        // console.log(product.owner._id)

        // If product does not exist
        // or product has already been removed
        if (!product || product.sold) throw new Error()

        // If product exists under user account, set sold to true
        product.sold = true
        product.dateSold = Date.now() // set the dateSold to today
        await product.save()

        res.send(product)
    } catch (e) {
        res.status(400).send({ error: 'Something went wrong' })
    }
})

module.exports = router