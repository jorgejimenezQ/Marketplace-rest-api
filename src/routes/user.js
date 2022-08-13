/**
 * Copyright (c) 2017
 *
 * long description for the file
 *
 * @summary Operations on users
 * @author Jorge Jimenez <jimenezjorge717@gmail.com>
 *
 */

const express = require('express')
const authenticate = require('../middleware/auth.js')
const User = require('../models/user/user.js')
const Product = require('../models/product/product.js')
const Message = require('../models/message/message.js')
const statusCodes = require('../utils/utils.js')

const router = new express.Router() // Router constructor

// Create a user
router.post('/users', async (req, res) => {
    // Get the user and save it
    const user = new User(req.body)

    try {
        await user.save()
        //TODO: Create a handler for user images

        // Generate token and get user profile
        const token = await user.generateToken()
        const profile = await user.createProfile()

        res.send({ user: profile, token: token })
    } catch (e) {
        res.status(400).send({
            error: 'There was an error creating the account.',
            // message: e.message,
        })
    }
})

// Get user's account
router.get('/users/getAccount', authenticate, async (req, res) => {
    try {
        // console.log(data)
        res.send(req.user)
    } catch (e) {
        res.status(400).send({
            error: 'There was a problem.',
            stackMessage: e.message,
        })
    }
})

// Log in a user
router.post('/users/logIn', async (req, res) => {
    try {
        // Try to get the user from the credentials passed in and create a token
        const user = await User.getAccount(req.body.email, req.body.password)

        // Check if user has been deleted
        if (user.deleted)
            return res.status(400).send({ error: 'Unable to log user in!' })

        // If active user generate token and send!
        const token = await user.generateToken()
        const profile = await user.createProfile()

        res.send({ user: profile, token: token })
    } catch (e) {
        res.status(400).send()
    }
})

// Get a user by the username
router.get('/users/:username/getUser', async (req, res) => {
    const username = req.params.username

    try {
        // Find the user and create a profile of the user's account
        const user = await User.findOne({ username })
        if (!user || user.deleted) {
            return res.status(404).send({ error: 'User not found!' })
        }

        const profile = await user.createProfile()

        res.send(profile)
    } catch (e) {
        res.status(400).send({
            error: 'There was a problem.',
            //    stackMessage: e.message,
        })
    }
})

// Update user
router.patch('/users', authenticate, async (req, res) => {
    const updates = Object.keys(req.body)
    const isValidOperation = validateUpdate(updates, ['email', 'password'])

    // Check for a valid operation
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        // Set all the updates
        console.log(req.body['email'])
        updates.forEach((update) => (req.user[update] = req.body[update]))

        // Save and send!
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send({ error: 'Unable to update user!' })
    }
})

// Delete the account ––Only set the "deleted" to
// true and set "dateDeleted" to now
router.delete('/users', authenticate, async (req, res) => {
    try {
        // Set to deleted and set delted date
        req.user.deleted = true
        req.user.dateDeleted = Date.now()

        // Remove all tokens
        req.user.tokens = []

        // Set all products as removed
        await Product.updateMany(
            { owner: req.user._id },
            { removed: true, dateRemoved: Date.now() }
        )

        // Save and send
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Log user out with current token
router.post('/users/logOut', authenticate, async (req, res) => {
    try {
        // Get a copy of the tokens array without the token we want to delete
        req.user.tokens = req.user.tokens.filter((e) => e.token !== req.token)

        // Save!!
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(400).send(e)
    }
})

// Log out all
router.post('/users/logOutAll', authenticate, async (req, res) => {
    try {
        // Set the tokens arrya to an empty array
        req.user.tokens = []
        // Save!!
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get all the product from a user with their username
router.get('/users/:username/getProducts', async (req, res) => {
    try {
        // Find the user with username
        const user = await User.findOne({
            username: req.params.username,
        }).populate('products')

        // Add the username to the object and send
        const products = user.products
        products.owner = user.username
        res.send({ user, products })
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router
