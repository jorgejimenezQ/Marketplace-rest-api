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
const mongoose = require('mongoose')
const statusCodes = require('../utils/utils.js')

const User = require('../models/user/user.js')
const Product = require('../models/product/product.js')

const Message = require('../models/message/message.js')
const MessageGroup = require('../models/message/messageGroup.js')
const UserConversation = require('../models/message/userConversation.js')

const router = new express.Router() // Router constructor

// Send a message
router.post('/messages', authenticate, async (req, res) => {
    try {
        // Find the recipient for the message
        const recipient = await User.findOne({ username: req.body.recipient })
        if (!recipient) {
            return res
                .status(400)
                .send({ error: `The user ${recipient} was not found!` })
        }

        // Create a messageGroup and set the message's id to the
        // messageGroup's id
        const msgGroup = new MessageGroup({
            user1: req.user._id,
            user2: recipient._id,
        })

        await msgGroup.save()

        //
        // Create an id for the message as well as the messageGroup
        // const msgId = new mongoose.Types.ObjectId()
        const message = new Message({
            _id: msgGroup._id,
            owner: req.user._id,
            recipient: recipient._id,
            messageBody: req.body.messageBody,
            messageGroup: msgGroup._id,
            parent: null, // Set the message as the root message
        })

        await message.save()

        // Send a representation of the message
        res.send(message.toMessage(message, req.user, recipient))
    } catch (e) {
        res.status(400).send({ error: 'Something went wrong', errorMessage: e })
    }
})

// Read a message
router.get('/messages/:messageId', authenticate, async (req, res) => {
    try {
        // Get the message from db
        const message = await Message.findById(req.params.messageId)

        // Did we get anything
        if (!message || message.deleted) {
            throw new Error()
        }

        // Get the owner and the recipient
        await message.populate('owner')
        await message.populate('recipient')

        // console.log(message.messageGroup)

        // Send a representation of the message model to the user
        res.send(message.toMessage(message, message.owner, message.recipient))
    } catch (e) {
        res.status(400).send({ error: 'Something went wrong', errorMessage: e })
    }
})

// Delete a conversation TODO
router.delete('/messages/:messageId', authenticate, async (req, res) => {
    try {
        // Get the message from db
        const message = await Message.findById(req.params.messageId)

        // Did we get anything
        if (!message || message.deleted) {
            throw new Error()
        }

        message.deleted = true
        message.dateDeleted = Date.now()
        await message.save()

        res.send()
    } catch (e) {
        res.status(400).send({ error: 'Something went wrong', errorMessage: e })
    }
})

// Get all the conversations
router.get('/messages/me/getConversations', authenticate, async (req, res) => {
    try {
        // Get all the UserConversations where the
        // user is this user
        const userConv = await UserConversation.find({})

        res.send()
    } catch (e) {
        res.status(400).send({ error: 'Something went wrong', errorMessage: e })
    }
})

module.exports = router
