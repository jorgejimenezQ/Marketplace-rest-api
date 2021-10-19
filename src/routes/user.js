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
const User = require('../models/user.js')
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
        })
    }
})

// Get user's account
router.get('/users/getAccount', authenticate, async (req, res) => {
    try {
        // console.log(data)
        res.send(req.user)
    } catch (e) {
        res.status(400).send('There was a problem.')
    }
})

// Log in a user
router.post('/users/logIn', async (req, res) => {
    try {
        // Try to get the user from the credentials passed in and create a token
        const user = await User.getAccount(req.body.email, req.body.password)
        const token = await user.generateToken()
        const profile = await user.createProfile()

        res.send({ user: profile, token: token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get a user by the username
router.get('/users/:username/getUser', async (req, res) => {
    const username = req.params.username

    try {
        // Find the user and create a profile of the user's account
        const user = await User.findOne({ username })
        if (!user) {
            res.status(404).send('User not found.')
        }

        const profile = await user.createProfile()

        res.send(profile)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router
