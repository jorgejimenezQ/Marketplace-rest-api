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

        // Get the product's
        const product = await Product.findOne({
            itemNumber: req.body.itemNumber,
        })

        // Make sure the product's owner is the recipient
        if (recipient._id.toString() !== product.owner.toString()) {
            return res.status(500).send({
                error: "There was an error authenticating the product's owner",
            })
        }

        // Create a messageGroup and set the message's id to the
        // messageGroup's id
        const msgGroup = new MessageGroup({
            user1: req.user._id,
            user2: recipient._id,
        })
        await msgGroup.save(product)

        // Create a user convo for each user
        const conversation = await UserConversation.createUserConversation(
            req.user._id,
            recipient._id,
            product._id,
            msgGroup._id
        )

        const message = new Message({
            _id: msgGroup._id,
            owner: req.user._id,
            messageBody: req.body.messageBody,
            messageGroup: msgGroup._id,
            product: product._id,
        })
        await message.save()
        await message.populate('owner')

        console.log(product)
        message.product = product

        res.send({
            convId: conversation._id,
            message: message.toMessageBlock(req.user),
        })
    } catch (e) {
        res.status(500).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

// Post a message in an existing conversation
router.post(
    '/messages/create/:messageGroup',
    authenticate,
    async (req, res) => {
        try {
            // Find the conversation with the authenticated user and the conversationId
            const conv = await UserConversation.findOne({
                user: req.user._id,
                messageGroup: req.params.messageGroup,
            })
            if (!conv || conv.deleted) {
                return res.status(500).send({
                    error: 'There was an error creating or authenticating the conversation.',
                })
            }

            const otherUserConv = await UserConversation.findOne({
                user: conv.otherUser,
                messageGroup: conv.messageGroup,
            })

            // Create a message with the same message group as
            // as the conversation
            const message = new Message({
                owner: req.user._id,
                messageBody: req.body.messageBody,
                messageGroup: conv.messageGroup,
                product: conv.product,
            })

            await message.save()
            await message.populate('product')

            // Let the user the other user has deleted the conversation
            const responseBlock = !otherUserConv.deleted
                ? {
                      convId: conv._id,
                      message: message.toMessageBlock(req.user),
                  }
                : {
                      ...message.toMessageBlock(req.user),
                      otherUserDeletedConversation: true,
                  }

            res.send(responseBlock)
        } catch (e) {
            res.status(400).send({
                error: 'Something went wrong',
                errorMessage: e.message,
            })
        }
    }
)

// Post a message in an existing conversation
router.post('/messages/:conversationId', authenticate, async (req, res) => {
    try {
        // Find the conversation with the authenticated user and the conversationId
        const conv = await UserConversation.findOne({
            user: req.user._id,
            _id: req.params.conversationId,
        })
        if (!conv || conv.deleted) {
            return res.status(500).send({
                error: 'There was an error creating or authenticating the conversation.',
            })
        }

        const otherUserConv = await UserConversation.findOne({
            user: conv.otherUser,
            messageGroup: conv.messageGroup,
        })

        // Create a message with the same message group as
        // as the conversation
        const message = new Message({
            owner: req.user._id,
            messageBody: req.body.messageBody,
            messageGroup: conv.messageGroup,
            product: conv.product,
        })

        await message.save()
        await message.populate('product')

        // Let the user the other user has deleted the conversation
        const responseBlock = !otherUserConv.deleted
            ? { convId: conv._id, message: message.toMessageBlock(req.user) }
            : {
                  ...message.toMessageBlock(req.user),
                  otherUserDeletedConversation: true,
              }

        res.send(responseBlock)
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

// Set a user's conversation's deleted to true
router.delete('/messages/:conversationId', authenticate, async (req, res) => {
    try {
        // Find the converstion with the username field passed in
        const conv = await UserConversation.findOne({
            user: req.user._id,
            _id: req.params.conversationId,
        })

        if (!conv || conv.deleted) {
            return res
                .status(404)
                .send({ error: 'The conversation was not found' })
        }

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
router.get('/messages/conversations', authenticate, async (req, res) => {
    try {
        // Get all the UserConversations where the
        // user is this user.
        // Populate messageGroup with users populated also
        const userConvs = await UserConversation.find({
            user: req.user._id,
            deleted: false,
        }).populate({
            path: 'user otherUser product',
        })

        // Create an array of conversation blocks
        const convBlocks = []
        userConvs.forEach((conv) => {
            convBlocks.push(conv.toConvBlock(conv.otherUser))
        })

        res.send(convBlocks)
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

/**
 * Takes an array of item numbers and returns the amount of messages per item number.
 *
 */
router.get('/messages/count', authenticate, async (req, res) => {
    try {
        // If the itemNumbers is not an array, return an error
        if (!Array.isArray(req.body.itemNumbers)) {
            return res.status(400).send({
                error: 'The itemNumbers must be an array',
            })
        }

        // If the itemNumbers is an empty array, return an empty array
        if (req.body.itemNumbers.length === 0) {
            return res.send([])
        }

        // Get all the product item itemNumbers
        const products = await Product.find({
            itemNumber: { $in: req.body.itemNumbers },
        })

        const itemNumbers = products.map((product) => product._id)

        // Get the number of messages for each item number
        const result = await Message.aggregate([
            {
                $match: {
                    product: { $in: itemNumbers },
                    owner: req.user._id,
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            {
                $group: { _id: '$product', count: { $sum: 1 } },
            },
        ])

        let count = await Message.populate(result, { path: 'itemNumber' })
        count = count.map((c) => {
            return { itemNumber: c._id[0].itemNumber, count: c.count }
        })

        res.send(count)
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

/**
 * Returns all the messages with a specific product
 */
router.get('/messages/product/:itemNumber', authenticate, async (req, res) => {
    try {
        // Find the product with the itemNumber
        const product = await Product.findOne({
            itemNumber: req.params.itemNumber,
        })

        if (!product) {
            return res.status(404).send({
                error: 'The product was not found',
            })
        }

        // Find all messages with this product
        const messages = await Message.find({ product: product._id })
            .populate(['owner', 'product', 'messageGroup'])
            .sort({ createdAt: 'desc' })

        // Create an array of message blocks
        res.send(messages)
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

/**
 * Returns all messages from a message group
 */
router.get(
    '/messages/messageGroup/:messageGroupId',
    authenticate,
    async (req, res) => {
        try {
            // Find the messages with the message group id
            const messages = await Message.find({
                messageGroup: req.params.messageGroupId,
            }).populate([
                'owner',
                'product',
                {
                    path: 'messageGroup',
                    select: 'user1 user2',
                    populate: [
                        { path: 'user1', select: 'username' },
                        { path: 'user2', select: 'username' },
                    ],
                },
            ])

            if (!messages) {
                return res.status(404).send({
                    error: 'The messages were not found',
                })
            }

            res.send(messages)
        } catch (e) {
            res.status(400).send({ error: e.message })
        }
    }
)

// Get all messages belonging to a conversation.
// Returns an array of message blocks to the client
router.get('/messages/:conversationId', authenticate, async (req, res) => {
    try {
        // Get the message group from the conversation id
        const conv = await UserConversation.findOne({
            _id: req.params.conversationId,
            user: req.user._id,
            deleted: false,
        })

        if (!conv) {
            return res
                .status(404)
                .send({ error: 'The conversation was not found' })
        }

        // Get the other user
        const otherUser = await User.findById(conv.otherUser)

        // Get all messages with the same messageGroup id
        const msgs = await Message.find({
            messageGroup: conv.messageGroup,
        }).populate('owner product')

        const msgBlocks = []
        let owner

        // Create a message block for each message in the
        // await Promise.all(
        //     msgs.map(async (m) => {
        //         if (!owner) {
        //             await m.populate('owner')
        //             owner = m.owner
        //         } else if (m.owner !== owner._id) {
        //             await m.populate('owner')
        //             owner = m.owner
        //         }

        //         msgBlocks.push(m.toMessageBlock(m.owner))
        //     })
        // )

        res.send(msgs)
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

// Get all conversations posted for a product
router.get(
    '/messages/conversations/:itemNumber',
    authenticate,
    async (req, res) => {
        try {
            // Get the product's itemNumber
            const product = await Product.findOne({
                itemNumber: req.params.itemNumber,
            })

            // Get conversations for this product
            const conversations = await UserConversation.find({
                product: product._id,
                user: req.user._id,
            }).populate(['user', 'otherUser', 'product'])

            res.send(conversations)
        } catch (e) {
            res.status(500).send({ error: e.message })
        }
    }
)

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

        if (conv.deleted) throw new Error('No message found')

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

module.exports = router
