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
const User = require('../models/user/user.js')
const Product = require('../models/product/product.js')
const authenticate = require('../middleware/auth.js')
const { validateUpdate } = require('../utils/utils.js')

const router = express.Router()

// Post a product
router.post('/products', authenticate, async (req, res) => {
    try {
        // Create the product from he authenticated user and
        // request body content
        const product = new Product({
            owner: req.user._id,
            ...req.body, // Get the request body
        })

        // Generate the item number
        const itemNumber = await product.generateItemNumber()
        product.itemNumber = itemNumber

        //
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

// Post a product with out authentication
router.post('/products/test', async (req, res) => {
    try {
        return res.status(401).send()
        const owner = await User.findOne({ username: req.body.owner })
        // request body content
        const product = new Product({
            owner: owner._id,
            description: req.body.description, // Get the request body
            name: req.body.name,
            condition: req.body.condition,
            price: req.body.price,
            category: req.body.category,
        })

        // Generate the item number
        const itemNumber = await product.generateItemNumber()
        product.itemNumber = itemNumber

        await product.save()
        if (!product) {
            res.status(400).send('There was a problem uploading the product.')
        }

        // Populate the username of the owner
        await product.populate('owner', 'username')
        console.log(product)
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
        if (!product || product.removed || product.sold) throw new Error()

        // If product exists under user account, set sold to true
        product.sold = true
        product.dateSold = Date.now() // set the dateSold to today
        await product.save()

        res.send(product.toProductBlock(req.user))
    } catch (e) {
        res.status(400).send({ error: 'Something went wrong' })
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
        if (!product || product.removed || product.sold) throw new Error()

        updates.forEach((update) => (product[update] = req.body[update]))

        // Save the updated product
        await product.save()

        // Populate the username of the owner
        await product.populate('owner', 'username')

        res.send(product.toProductBlock(req.user))
    } catch (e) {
        res.status(400).send({ error: 'Unable to updaet product.' })
    }
})

// Retrieve a product's info.
router.get('/products/:itemNumber', async (req, res) => {
    try {
        // Find the product with the itemNumber
        const product = await Product.findOne({
            itemNumber: req.params.itemNumber,
        })

        // If the product does not exist send error
        if (!product || product.removed)
            return res.status(400).send({ error: 'Product does not exist!' })

        await product.populate('owner')

        // Add the products to the response
        res.products = await product.toProductBlock(product.owner)
        res.send(res.products)
    } catch (error) {
        res.status(404).send({
            error: 'Could not find product',
            errorMessage: error.message,
        })
    }
})

// Get a product's owner
router.get('/products/:itemNumber/owner', async (req, res) => {
    try {
        // Get the product with the generateItemNumber
        // And populate the owner field
        const product = await Product.findOne({
            itemNumber: req.params.itemNumber,
        }).populate('owner')

        // If the product does not exist send error
        if (!product || product.removed)
            return res.status(400).send({ error: 'Product does not exist!' })

        // All good!
        res.send(await product.owner.getPublicInfo())
    } catch (e) {
        res.status(400).send({ error: 'Unable to find user' })
    }
})

// Retrieve a product's images. The response will contain an array of
// image urls
router.get('/products/:itemNumber/images', async (req, res) => {
    try {
        // Find the product with the itemNumber
        const product = await Product.findOne({
            itemNumber: req.params.itemNumber,
        })

        // If the product does not exist send error
        if (!product || product.removed)
            return res.status(400).send({ error: 'Product does not exist!' })

        // The product's "images" is an array of paths, and names
        const images = product.imagePaths

        res.send(images)
    } catch (error) {
        res.status(400).send({ error: 'Unable to find images' })
    }
})

// Get product by query
// {{url}}/tasks?sortBy=createdAt:desc&completed=false
router.get('/products', async (req, res) => {
    // Get the query & prepare it
    let { query, limit, skip, sortBy } = req.query
    let reg
    if (query === undefined) {
        query = ''
    } else {
        query = query.replace('*', '')
        query = query.replace('_', '|')
        reg = `^(${query})$`
    }
    console.log(new RegExp(reg))
    try {
        let products
        if (query === '') {
            products = await Product.find()
                .limit(+limit)
                .exec()
        } else {
            // console.log(new RegExp(reg))
            products = await Product.find({
                description: { $regex: new RegExp(reg), $options: 'i' },
            }).limit(+limit)
        }

        // Add the products to the response
        res.products = await Product.toProductBlockArray(products)

        res.send(res.products)
    } catch (e) {
        res.status(400).send({ error: 'Something went wrong', stack: e })
    }
})

module.exports = router
