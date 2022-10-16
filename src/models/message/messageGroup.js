const validator = require('validator')
const mongoose = require('mongoose')
const UserConversation = require('./userConversation.js')
const User = require('../user/user.js')

const msgGroupSchema = new mongoose.Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        deleted: Boolean,
        dateDeleted: Date,
    },
    { timestamps: true }
)

msgGroupSchema.methods.toJSON = function () {
    const group = this
    const groupObj = group.toObject()

    const result = {}
    result.id = group._id
    result.user1 = group.user1.toJSON()
    result.user2 = group.user2.toJSON()
    result.deleted = groupObj.deleted

    return result
}

// Save the messageGroup to the users
// msgGroupSchema.post('save', async function (doc, next) {
//     const group = this

//     // Create one userConversations for each
//     // user and save them
//     const userConv1 = new UserConversation({
//         user: group.user1,
//         otherUser: group.user2,
//         messageGroup: group._id,
//     })
//     const userConv2 = new UserConversation({
//         user: group.user2,
//         otherUser: group.user1,
//         messageGroup: group._id,
//     })

//     // Save the userConversations
//     await userConv1.save()
//     await userConv2.save()

//     if (!userConv1 || !userConv2) throw new Error('Something Went Wrong')
//     next()
// })

const MessageGroup = mongoose.model('MessageGroup', msgGroupSchema)
module.exports = MessageGroup
