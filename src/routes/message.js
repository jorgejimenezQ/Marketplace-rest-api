/**
 * Copyright (c) 2021
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

// Creates a conversation with the message passed
// returns a message block to the client. The message block will
// be the following:
// {
//     users: {
//         from: {
//             username: owner.username,
//             imageUrl: owner.imagePath.url,
//         },
//         to: {
//             username: recipient.username,
//             imageUrl: recipient.imagePath.url,
//         },
//     },
//     message: message.messageBody,
//     conversationId: message.messageGroup._id,
//     messageId: message._id,
//     date: message.createdAt,
//}

router.post('/messages', authenticate, async (req, res) => {
    try {
        // Find the recipient for the message
        const recipient = await User.findOne({ username: req.body.recipient })
        if (!recipient) {
            return res.status(400).send({
                error: `The user ${req.body.recipient} was not found!`,
            })
        }

        // Create a messageGroup and set the message's id to the
        // messageGroup's id
        const msgGroup = new MessageGroup({
            user1: req.user._id,
            user2: recipient._id,
        })

        await msgGroup.save()

        const message = new Message({
            _id: msgGroup._id,
            owner: req.user._id,
            messageBody: req.body.messageBody,
            messageGroup: msgGroup._id,
        })

        await message.save()

        res.send(message.toMessageBlock(req.user))
    } catch (e) {
        // console.log(e)
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

// Read a message. Send a message block to the
// client. See the above route's comment.
router.get('/messages/:messageId', authenticate, async (req, res) => {
    try {
        // Get the message from db
        const message = await Message.findById(req.params.messageId)

        // Did we get anything
        if (!message || message.deleted) {
            throw new Error()
        }

        // Check that the convresation has not been deleted
        const conv = await UserConversation.findOne({
            user: req.user._id,
            messageGroup: message.messageGroup,
        })

        if (conv.deleted) throw new Error()

        // Get the owner
        await message.populate('owner')

        // Send a representation of the message model to the user
        res.send(message.toMessageBlock(message.owner))
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            catchMessage: e.message,
        })
    }
})

// Set a user's conversation's deleted to true
router.delete('/messages/:conversationId', authenticate, async (req, res) => {
    try {
        console.log(req.user)
        // Find the converstion with the username field passed in
        const conv = await UserConversation.findOne({
            user: req.user._id,
            _id: req.params.conversationId,
        })

        if (!conv || conv.deleted) throw new Error()

        // Set deleted to true
        conv.deleted = true
        conv.dateDeleted = Date.now()

        await conv.save()

        // Set the
        res.send()
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

// Returns an array of conversation blocks to the client.
// conversationBlock: {
//     users: [
//         {
//             username: user1.username,
//             imageUrl: user1.imagePath.url,
//         },
//         {
//             username: user2.username,
//             imageUrl: user2.imagePath.url,
//         },
//     ],
//     conversationId: this._id,
//}
router.get(
    '/messages/user/getConversations',
    authenticate,
    async (req, res) => {
        try {
            // Get all the UserConversations where the
            // user is this user.
            const userConvs = await UserConversation.find({
                user: req.user._id,
            })
                // Populate messageGroup with users populated also
                .populate({
                    path: 'messageGroup',
                    populate: { path: 'user1 user2' },
                })

            // Create an array of conversatino blocks
            const convBlocks = []
            userConvs.forEach((conv) => {
                convBlocks.push(
                    conv.toConvBlock(
                        conv.messageGroup.user1,
                        conv.messageGroup.user2
                    )
                )
            })

            res.send(convBlocks)
        } catch (e) {
            res.status(400).send({
                error: 'Something went wrong',
                errorMessage: e.message,
            })
        }
    }
)

// Post a message in an existing conversation
router.post(
    '/messages/:conversationId/postMessage',
    authenticate,
    async (req, res) => {
        try {
            // Find the conversation with the conversationId
            const conv = await UserConversation.findById(
                req.params.conversationId
            )

            if (!conv) throw new Error()

            // Create a message with the same message group as
            // as the conversation
            const message = new Message({
                owner: req.user._id,
                messageBody: req.body.messageBody,
                messageGroup: conv.messageGroup,
            })

            await message.save()

            res.send(message.toMessageBlock(req.user))
        } catch (e) {
            res.status(400).send({
                error: 'Something went wrong',
                errorMessage: e.message,
            })
        }
    }
)
// Get all messages belonging to a conversation.
// Returns an array of message blocks to the client
router.get(
    '/messages/:conversationId/getAllMessages',
    authenticate,
    async (req, res) => {
        try {
            // Get the message group from the conversation id
            const conv = await UserConversation.findOne({
                _id: req.params.conversationId,
                user: req.user._id,
            })

            if (!conv || conv.deleted) throw new Error()

            // Get the other user
            const otherUser = await User.findById(conv.otherUser)

            // Get all messages with the same messageGroup id
            const msgs = await Message.find({
                messageGroup: conv.messageGroup,
            })

            const msgBlocks = []
            let owner

            // Create a message block for each message in the
            await Promise.all(
                msgs.map(async (m) => {
                    if (!owner) {
                        await m.populate('owner')
                        owner = m.owner
                    } else if (m.owner !== owner._id) {
                        await m.populate('owner')
                        owner = m.owner
                    }

                    msgBlocks.push(m.toMessageBlock(m.owner))
                })
            )

            res.send(msgBlocks)
        } catch (e) {
            res.status(400).send({
                error: 'Something went wrong',
                errorMessage: e.message,
            })
        }
    }
)

module.exports = router
